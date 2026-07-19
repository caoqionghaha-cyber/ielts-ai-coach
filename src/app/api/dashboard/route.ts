import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, seedEssays, seedVocabulary, seedIdeas, seedSentences } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";

export async function GET(req: NextRequest) {
  seedSentences();
  seedEssays();
  seedVocabulary();
  seedIdeas();
  
  const user = getUserFromToken(req);
  if (!user) {
    // Return default empty data for guests
    return NextResponse.json({
      today_review_count: 0,
      today_error_count: 0,
      today_practice_count: 0,
      recent_errors: [],
      review_items: [],
      total_practices: 0,
      average_score: 0,
      weekly_practice_count: 0,
      continuous_days: 0,
      error_reduction: 0,
    });
  }
  
  const db = readDb();
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
  const todayPractices = db.practices.filter(p => p.user_id === user.id && p.practice_time >= todayStart).length;
  const pendingReviews = db.reviews.filter(r => r.user_id === user.id && r.next_review_time <= now.toISOString()).length;
  const userErrors = db.errors.filter(e => e.user_id === user.id).sort((a, b) => b.count - a.count).slice(0, 5);
  const totalErrors = db.errors.filter(e => e.user_id === user.id).length;
  const totalPractices = db.practices.filter(p => p.user_id === user.id).length;
  const avgScore = totalPractices > 0 ? db.practices.filter(p => p.user_id === user.id).reduce((s, p) => s + p.score, 0) / totalPractices : 0;
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weeklyPractices = db.practices.filter(p => p.user_id === user.id && p.practice_time >= weekAgo).length;
  
  const reviewItems = db.reviews.filter(r => r.user_id === user.id && r.next_review_time <= now.toISOString()).slice(0, 10).map(r => {
    let content = null;
    if (r.content_type === "practice") {
      const practice = db.practices.find(p => p.id === r.content_id);
      if (practice) { const s = db.sentences.find(ss => ss.id === practice.sentence_id); content = { english: s?.english || "", chinese: s?.chinese || "", answer: practice.answer, score: practice.score }; }
    } else if (r.content_type === "error") {
      const error = db.errors.find(e => e.id === r.content_id);
      if (error) content = { error_type: error.error_type, wrong: error.wrong, correct: error.correct };
    }
    return { id: r.id, content_type: r.content_type, content_id: r.content_id, mastery: r.mastery, review_count: r.review_count, next_review_time: r.next_review_time, content };
  });

  return NextResponse.json({
    today_review_count: pendingReviews,
    today_error_count: totalErrors,
    today_practice_count: todayPractices,
    recent_errors: userErrors.map(e => ({ id: e.id, error_type: e.error_type, wrong: e.wrong, correct: e.correct, context: e.context, count: e.count })),
    review_items: reviewItems,
    total_practices: totalPractices,
    average_score: Math.round(avgScore * 10) / 10,
    weekly_practice_count: weeklyPractices,
    continuous_days: user.continuous_days || 0,
    error_reduction: 0,
  });
}