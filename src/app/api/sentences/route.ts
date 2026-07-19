import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, seedSentences } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";

export async function GET(req: NextRequest) {
  seedSentences();
  const db = readDb();
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const search = searchParams.get("search");
  const skip = parseInt(searchParams.get("skip") || "0");
  const limit = parseInt(searchParams.get("limit") || "20");
  let filtered = [...db.sentences];
  if (topic) filtered = filtered.filter(s => s.topic === topic);
  if (search) filtered = filtered.filter(s => s.english.includes(search) || s.chinese.includes(search));
  const total = filtered.length;
  const sentences = filtered.slice(skip, skip + limit);
  return NextResponse.json({ sentences, total });
}

export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  const db = readDb();
  const data = await req.json();
  const id = ++db.counters.sentences;
  const sentence = { id, user_id: user?.id || 0, english: data.english, chinese: data.chinese, topic: data.topic || "", band_level: data.band_level || "Band 7+", tags: data.tags || "", source: data.source || "", created_time: new Date().toISOString() };
  db.sentences.push(sentence);
  writeDb(db);
  return NextResponse.json(sentence);
}