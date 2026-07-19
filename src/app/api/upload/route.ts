import { NextRequest, NextResponse } from "next/server";

interface SentencePair {
  chinese: string;
  english: string;
}

function parseSentencePairs(text: string): SentencePair[] {
  const pairs: SentencePair[] = [];
  const rawLines = text.split(/\r?\n/);
  const chineseRegex = /[\u4e00-\u9fff]/;

  function isEnglish(s: string): boolean {
    const en = (s.match(/[a-zA-Z]/g) || []).length;
    const cn = (s.match(/[\u4e00-\u9fff]/g) || []).length;
    return en > cn;
  }

  // Split into sentences, handling decimal numbers properly
  function splitSentences(text: string): string[] {
    // First replace decimal numbers with a placeholder to protect them
    const protectedText = text.replace(/\d+\.\d+/g, m => "NUM" + m.replace(".", "P") + "NUM");
    // Now split by sentence boundaries (not affected by decimals)
    // English: . ? ! followed by space/capital letter; Chinese: 。? ！
    const parts = protectedText.split(/(?<=[.?!])\s+(?=[A-Z"])|(?<=[。？！])/);
    // Restore decimal points
    return parts.map(s => s.trim().replace(/NUM(\d+P\d+)NUM/g, (_, m) => m.replace("P", "."))).filter(s => s.length > 0);
  }

    // Step 1: Group lines into paragraphs (auto-detect language changes)
  function getLineLang(line: string) {
    const hasEn = /[a-zA-Z]{3,}/.test(line);
    const hasCn = /[\u4e00-\u9fff]/.test(line);
    if (hasEn && hasCn) return "mixed";
    if (hasCn) return "zh";
    if (hasEn) return "en";
    return "mixed";
  }
  function paraIsMostlyEn(para: string[]) {
    const joined = para.join(" ");
    const enCt = (joined.match(/[a-zA-Z]/g) || []).length;
    const cnCt = (joined.match(/[\u4e00-\u9fff]/g) || []).length;
    return enCt >= cnCt;
  }
  const paragraphs = [];
  let currentPara = [];
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (trimmed.length === 0) {
      if (currentPara.length > 0) { paragraphs.push(currentPara.join(" ")); currentPara = []; }
    } else {
      // Auto-detect language boundary: if line language differs from current paragraph,
      // start a new paragraph (handles missing blank lines between EN and CN sections)
      if (currentPara.length > 0) {
        const ll = getLineLang(trimmed);
        const paraEn = paraIsMostlyEn(currentPara);
        if ((paraEn && ll === "zh") || (!paraEn && ll === "en")) {
          paragraphs.push(currentPara.join(" "));
          currentPara = [];
        }
      }
      currentPara.push(trimmed);
    }
  }
  if (currentPara.length > 0) paragraphs.push(currentPara.join(" "));
  const validParas = paragraphs.filter(p => p.replace(/\s+/g, "").length > 0);

  // Method 1: Label-based (中文:/English:)
  const chineseLabel = /^(?:中文|Chinese)\s*[：:.]?\s*/i;
  const englishLabel = /^(?:英文|English)\s*[：:.]?\s*/i;
  for (const line of rawLines) {
    const parts = line.split(/(?:中文|Chinese)\s*[：:.]?\s*|(?:英文|English)\s*[：:.]?\s*/i).filter(p => p.trim().length > 0);
    if (parts.length === 2) {
      const fCn = chineseRegex.test(parts[0]), sCn = chineseRegex.test(parts[1]);
      if (!fCn && sCn) pairs.push({ chinese: parts[1].trim(), english: parts[0].trim() });
      else if (fCn && !sCn) pairs.push({ chinese: parts[0].trim(), english: parts[1].trim() });
    }
  }
  if (pairs.length > 0) return deduplicate(pairs);

  // Method 2: Same line mixed
  for (const line of rawLines) {
    const t = line.trim();
    if (!t || t.length < 10) continue;
    if (chineseRegex.test(t) && /[a-zA-Z]{3,}/.test(t)) {
      const m1 = t.match(/^([a-zA-Z0-9\s,\-;:\x27"()]+[.?!])\s+([\u4e00-\u9fff].*)$/);
      if (m1) pairs.push({ english: m1[1].trim(), chinese: m1[2].trim() });
      else { const m2 = t.match(/^([\u4e00-\u9fff].*[。？！])\s+([a-zA-Z].*)$/); if (m2) pairs.push({ chinese: m2[1].trim(), english: m2[2].trim() }); }
    }
  }
  if (pairs.length > 0) return deduplicate(pairs);

  // Method 3: Alternating paragraph pairs with sentence-level matching
  const enParas = validParas.filter(p => isEnglish(p));
  const cnParas = validParas.filter(p => !isEnglish(p) && chineseRegex.test(p));

  for (let i = 0; i < Math.min(enParas.length, cnParas.length); i++) {
    const enS = splitSentences(enParas[i]);
    const cnS = splitSentences(cnParas[i]);

    if (enS.length === cnS.length) {
      // Perfect alignment: 1-to-1 sentence match
      for (let j = 0; j < enS.length; j++) {
        pairs.push({ english: enS[j], chinese: cnS[j] });
      }
    } else if (enS.length === 1 && cnS.length === 1) {
      pairs.push({ english: enS[0], chinese: cnS[0] });
    } else {
      // Uneven sentences - try to merge to match
      // Count Chinese chars in each to guess alignment
      if (enS.length < cnS.length && cnS.length <= enS.length * 3) {
        // Merge some Chinese sentences to match English
        const merged = smartMerge(cnS, enS.length);
        for (let j = 0; j < Math.min(enS.length, merged.length); j++) {
          pairs.push({ english: enS[j], chinese: merged[j] });
        }
      } else if (cnS.length < enS.length && enS.length <= cnS.length * 3) {
        const merged = smartMerge(enS, cnS.length);
        for (let j = 0; j < Math.min(merged.length, cnS.length); j++) {
          pairs.push({ english: merged[j], chinese: cnS[j] });
        }
      } else {
        // Fall back to full paragraph as one pair
        pairs.push({ english: enParas[i], chinese: cnParas[i] });
      }
    }
  }

  // Method 4: Line-level alternating
  if (pairs.length === 0) {
    const lines = rawLines.map(l => l.trim()).filter(l => l.length > 0);
    for (let i = 0; i < lines.length - 1; i++) {
      const fCn = chineseRegex.test(lines[i]), sCn = chineseRegex.test(lines[i+1]);
      if (!fCn && sCn) { pairs.push({ english: lines[i], chinese: lines[i+1] }); i++; }
      else if (fCn && !sCn) { pairs.push({ chinese: lines[i], english: lines[i+1] }); i++; }
    }
  }

  return deduplicate(pairs.filter(p => p.chinese && p.english && chineseRegex.test(p.chinese)));
}

function smartMerge(items: string[], targetCount: number): string[] {
  if (items.length <= targetCount) return items;
  const result: string[] = [];
  // Distribute items evenly into targetCount groups
  const perGroup = Math.floor(items.length / targetCount);
  const extra = items.length % targetCount;
  let idx = 0;
  for (let i = 0; i < targetCount; i++) {
    const count = perGroup + (i < extra ? 1 : 0);
    result.push(items.slice(idx, idx + count).join(" "));
    idx += count;
  }
  return result;
}

function deduplicate(pairs: SentencePair[]): SentencePair[] {
  const seen = new Set<string>();
  return pairs.filter(p => {
    const key = p.english.replace(/\s+/g, " ").substring(0, 60);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    const buffer = Buffer.from(await (file as File).arrayBuffer());
    const fileName = (file as File).name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".txt")) text = buffer.toString("utf-8");
    else if (fileName.endsWith(".docx")) {
      try {
        const content = buffer.toString("utf-8");
        const xmlMatch = content.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
        text = xmlMatch ? xmlMatch.map(m => m.replace(/<[^>]+>/g, "")).join("\n") : content.replace(/[^\x20-\x7e\u4e00-\u9fff\n]/g, " ").replace(/\s+/g, " ").trim();
      } catch { text = buffer.toString("utf-8").replace(/[\x00-\x08\x0b-\x0c\x0e-\x1f]/g, ""); }
    } else if (fileName.endsWith(".pdf")) {
      const pdfText = buffer.toString("utf-8");
      const parenText = pdfText.match(/\(([^)]*)\)/g);
      text = parenText ? parenText.map(m => m.slice(1, -1)).join("\n") : pdfText.replace(/[^\x20-\x7e\u4e00-\u9fff\n]/g, " ").replace(/\s+/g, " ").trim();
    } else {
      return NextResponse.json({ error: "Unsupported format. Please upload .txt, .docx, or .pdf" }, { status: 400 });
    }

    const pairs = parseSentencePairs(text);
    return NextResponse.json({ pairs: pairs.slice(0, 200), total: pairs.length, filename: (file as File).name });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}




