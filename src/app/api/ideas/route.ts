import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, seedIdeas } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";

export async function GET(req: NextRequest) {
  seedIdeas();
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const search = searchParams.get("search");
  let items = readDb().ideas.filter(i => i.user_id === 0);
  if (topic) items = items.filter(i => i.topic === topic);
  if (search) items = items.filter(i => i.question.includes(search) || i.topic.includes(search));
  return NextResponse.json({ ideas: items, total: items.length });
}

export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  const db = readDb();
  const data = await req.json();
  const id = ++db.counters.ideas;
  db.ideas.push({ id, user_id: user?.id || 0, topic: data.topic, question: data.question, position: data.position, reason: data.reason, explanation: data.explanation, example: data.example, related_words: data.related_words || "", band_level: data.band_level || "Band 7+", created_time: new Date().toISOString() });
  writeDb(db);
  return NextResponse.json({ id });
}