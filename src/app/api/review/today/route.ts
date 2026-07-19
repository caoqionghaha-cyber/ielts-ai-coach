import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json([]);
  const now = new Date().toISOString();
  const items = readDb().reviews.filter(r => r.user_id === user.id && r.next_review_time <= now).slice(0, 20).map(r => {
    let content = null;
    const db = readDb();
    if (r.content_type === "practice") {
      const practice = db.practices.find(p => p.id === r.content_id);
      if (practice) { const s = db.sentences.find(ss => ss.id === practice.sentence_id); content = { english: s?.english || "", chinese: s?.chinese || "", answer: practice.answer }; }
    } else if (r.content_type === "error") {
      const error = db.errors.find(e => e.id === r.content_id);
      if (error) content = { error_type: error.error_type, wrong: error.wrong, correct: error.correct };
    }
    return { id: r.id, content_type: r.content_type, content_id: r.content_id, mastery: r.mastery, review_count: r.review_count, next_review_time: r.next_review_time, content };
  });
  return NextResponse.json(items);
}