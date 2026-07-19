export interface EssayAnalysis {
  estimated_band: string;
  detected_topic: string;
  analysis_text: string;
  paragraphs: Array<{
    type: string;
    text: string;
    word_count: number;
  }>;
  vocabulary_highlights: string[];
}

const HIGH_LEVEL_WORDS = [
  "significant", "substantial", "consequently", "inevitable", "comprehensive",
  "demonstrate", "mitigate", "furthermore", "nevertheless", "consequently",
  "fundamental", "essential", "crucial", "vital", "paramount",
  "advocate", "contend", "assert", "propose", "acknowledge",
  "phenomenon", "perspective", "implication", "predicament", "notion",
  "exacerbate", "alleviate", "facilitate", "undermine", "reinforce",
  "ultimately", "increasingly", "predominantly", "significantly",
];

const TOPIC_WORDS: Record<string, string[]> = {
  "Education": ["education", "school", "university", "student", "teacher", "learn", "study", "curriculum", "homework", "tuition", "academic"],
  "Technology": ["technology", "digital", "internet", "social media", "computer", "innovation", "communication", "online", "smartphone", "AI", "artificial"],
  "Environment": ["environment", "climate", "pollution", "energy", "renewable", "green", "emission", "fossil", "sustainable", "carbon", "waste", "recycle"],
  "Society": ["society", "social", "community", "public", "government", "policy", "citizen", "inequality", "welfare", "crime", "cultural"],
  "Health": ["health", "disease", "hospital", "medical", "diet", "exercise", "obesity", "mental", "wellbeing", "healthcare", "nutrition"],
  "Economy": ["economy", "economic", "growth", "business", "employment", "job", "income", "tax", "investment", "trade", "market", "finance"],
};

export function analyzeEssayContent(content: string): EssayAnalysis {
  const paragraphs = content.split("\n\n").filter(Boolean);
  const allWords = content.toLowerCase().split(/\s+/).filter(w => w.length > 2);

  // Detect paragraph types
  const paraInfo = paragraphs.map((p, i) => {
    const words = p.split(/\s+/);
    const firstWords = p.toLowerCase().trim().substring(0, 40);
    let type = "body";
    if (i === 0 && (firstWords.includes("recent years") || firstWords.includes("nowadays") || firstWords.includes("in the modern") || firstWords.includes("it is") || firstWords.includes("there is") || firstWords.includes("this essay"))) type = "introduction";
    else if (i === paragraphs.length - 1 && (firstWords.includes("in conclusion") || firstWords.includes("to conclude") || firstWords.includes("in my opinion") || firstWords.includes("in summary"))) type = "conclusion";
    return { type, text: p, word_count: words.length };
  });

  // Detect topic
  const topicScores: Record<string, number> = {};
  for (const [topic, keywords] of Object.entries(TOPIC_WORDS)) {
    topicScores[topic] = keywords.filter(kw => allWords.includes(kw)).length;
  }
  const detectedTopic = Object.entries(topicScores).sort((a, b) => b[1] - a[1])[0]?.[0] || "General";
  const topicConfidence = Object.entries(topicScores).sort((a, b) => b[1] - a[1])[0]?.[1] || 0;

  // Highlight high-level vocab
  const vocabSet = new Set<string>();
  content.split(/\s+/).forEach(w => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, "");
    if (HIGH_LEVEL_WORDS.includes(clean)) vocabSet.add(clean);
  });
  const vocabularyHighlights = [...vocabSet].sort();

  // Estimate band score
  let band = 6.5;
  const totalWords = allWords.length;
  const avgParaWords = totalWords / Math.max(paragraphs.length, 1);
  const hasIntro = paraInfo.some(p => p.type === "introduction");
  const hasConclusion = paraInfo.some(p => p.type === "conclusion");
  const hasComplexVocab = vocabularyHighlights.length >= 5;
  const hasMultipleParas = paragraphs.length >= 4;

  if (totalWords > 250 && hasIntro && hasConclusion && hasComplexVocab && hasMultipleParas) band = 7.5;
  else if (totalWords > 200 && hasIntro && hasConclusion && hasComplexVocab) band = 7.0;
  else if (totalWords > 180 && hasIntro) band = 6.5;

  if (topicConfidence === 0) band = Math.max(5.5, band - 0.5);

  const analysisText = [
    "📝 文章结构分析",
    "",
    ...paraInfo.map((p, i) => `段落 ${i + 1}（${p.type === "introduction" ? "引言段" : p.type === "conclusion" ? "结论段" : "主体段"}，${p.word_count}词）`),
    "",
    `📊 文章统计`,
    `总字数: ${totalWords} 词`,
    `段落数: ${paragraphs.length}`,
    `估算难度: ${band >= 7 ? "Band 7+ 难度" : band >= 6.5 ? "Band 6-6.5 难度" : "Band 5-6 难度"}`,
    `检测主题: ${detectedTopic}`,
    "",
    vocabularyHighlights.length > 0 ? `💡 高级词汇 (${vocabularyHighlights.length}个): ${vocabularyHighlights.join(", ")}` : "💡 高级词汇: 建议增加更丰富的词汇表达",
    "",
    "📋 结构评价",
    hasIntro && hasConclusion ? "✅ 文章具有完整的引言和结论" : hasIntro ? "✅ 有引言，建议补充结论" : "⚠️ 缺少引言",
    hasMultipleParas ? "✅ 段落结构合理" : "⚠️ 建议增加段落数",
    totalWords >= 250 ? "✅ 字数达标" : `⚠️ 建议扩充内容，目标250词以上（当前${totalWords}词）`,
  ].join("\n");

  return {
    estimated_band: band.toFixed(1),
    detected_topic: topicConfidence > 0 ? detectedTopic : "General",
    analysis_text: analysisText,
    paragraphs: paraInfo,
    vocabulary_highlights: vocabularyHighlights,
  };
}
