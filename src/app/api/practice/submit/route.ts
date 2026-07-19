import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";
import { gradeTranslation } from "@/lib/server/ai";

export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  const db = readDb();
  const { sentence_id, answer } = await req.json();
  const sentence = db.sentences.find(s => s.id === sentence_id);
  if (!sentence) return NextResponse.json({ detail: "Sentence not found" }, { status: 404 });
  const feedback = gradeTranslation(sentence.english, sentence.chinese, answer);
  const practiceId = ++db.counters.practices;
  const practice = { id: practiceId, user_id: user?.id || 0, sentence_id, answer, score: feedback.total_score, practice_time: new Date().toISOString() };
  db.practices.push(practice);
  if (user) {
    for (const err of feedback.errors) {
      const existing = db.errors.find(e => e.user_id === user.id && e.wrong === err.wrong && e.correct === err.correct);
      if (existing) existing.count += 1;
      else db.errors.push({ id: ++db.counters.errors, user_id: user.id, error_type: err.type, wrong: err.wrong, correct: err.correct, context: err.context, count: 1, created_time: new Date().toISOString() });
    }
    db.reviews.push({ id: ++db.counters.reviews, user_id: user.id, content_type: "practice", content_id: practiceId, mastery: Math.min(Math.floor(feedback.total_score / 20), 5), error_count: feedback.errors.length, review_count: 0, next_review_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), created_time: new Date().toISOString() });
  }
  writeDb(db);
  return NextResponse.json({ id: practiceId, sentence_id, english: sentence.english, chinese: sentence.chinese, answer, score: feedback.total_score, practice_time: practice.practice_time, feedback });
}