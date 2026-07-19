import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, seedVocabulary } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";

export async function GET(req: NextRequest) {
  seedVocabulary();
  const { searchParams } = new URL(req.url);
  const topic = searchParams.get("topic");
  const search = searchParams.get("search");
  let items = readDb().vocabulary.filter(v => v.user_id === 0);
  if (topic) items = items.filter(v => v.topic === topic);
  if (search) items = items.filter(v => v.word.includes(search) || v.meaning.includes(search));
  return NextResponse.json({ vocabulary: items, total: items.length });
}

export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  const { word, meaning, synonyms, collocations, example, topic, band_level } = await req.json();
  const db = readDb();
  const id = ++db.counters.vocabulary;
  db.vocabulary.push({ id, user_id: user?.id || 0, word, meaning, synonyms, collocations, example, topic: topic || "General", band_level: band_level || "Band 7+", created_time: new Date().toISOString() });
  writeDb(db);
  return NextResponse.json({ id });
}