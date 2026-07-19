import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";

export async function POST(req: NextRequest) {
  const db = readDb();
  const sentences = await req.json();
  let count = 0;
  for (const s of sentences) {
    db.sentences.push({ id: ++db.counters.sentences, english: s.english, chinese: s.chinese, topic: s.topic || "", band_level: s.band_level || "Band 7+", tags: "", source: "", created_time: new Date().toISOString() });
    count++;
  }
  writeDb(db);
  return NextResponse.json({ message: "Imported " + count + " sentences", count });
}