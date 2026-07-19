import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, seedEssays } from "@/lib/server/db";
import { analyzeEssayContent } from "@/lib/server/essayAnalyzer";

export async function GET(req: NextRequest) {
  seedEssays();
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  let essays = readDb().essays.filter(e => e.source === "Sample");
  if (topic) essays = essays.filter(e => e.topic === topic);
  return NextResponse.json({ essays, total: essays.length });
}

export async function POST(req: NextRequest) {
  const { title, content, topic } = await req.json();
  if (!content || !content.trim()) {
    return NextResponse.json({ error: "Content is required" }, { status: 400 });
  }
  const db = readDb();
  const analysis = analyzeEssayContent(content);
  const id = ++db.counters.essays;
  const essay = {
    id,
    user_id: 0,
    title: title || "Imported Essay",
    content,
    band_score: analysis.estimated_band,
    topic: topic || analysis.detected_topic || "General",
    analysis: analysis.analysis_text,
    source: "Imported",
    created_time: new Date().toISOString(),
  };
  db.essays.push(essay as any);
  writeDb(db);
  return NextResponse.json({ ...essay, analysis_detail: analysis });
}
