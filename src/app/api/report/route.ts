import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ total_practices: 0, average_score: 0, total_errors: 0, total_reviews: 0, total_essays: 0, weekly_practices: 0, score_history: [], top_errors: [], continuous_days: 0 });
  const db = readDb();
  const totalPractices = db.practices.filter(p => p.user_id === user.id).length;
  const avgScore = totalPractices > 0 ? db.practices.filter(p => p.user_id === user.id).reduce((s, p) => s + p.score, 0) / totalPractices : 0;
  const totalErrors = db.errors.filter(e => e.user_id === user.id).length;
  const totalEssays = db.essay_practices.filter(p => p.user_id === user.id && p.submitted).length;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const weeklyPractices = db.practices.filter(p => p.user_id === user.id && p.practice_time >= weekAgo).length;
  const practiceHistory = db.practices.filter(p => p.user_id === user.id).sort((a, b) => a.practice_time.localeCompare(b.practice_time)).slice(-30).map(p => p.score);
  const byType: Record<string, number> = {};
  db.errors.filter(e => e.user_id === user.id).forEach(e => { byType[e.error_type] = (byType[e.error_type] || 0) + e.count; });
  const topErrors = Object.entries(byType).sort((a, b) => b[1] - a[1]).slice(0, 5);
  return NextResponse.json({ total_practices: totalPractices, average_score: Math.round(avgScore * 10) / 10, total_errors: totalErrors, total_reviews: db.reviews.filter(r => r.user_id === user.id).length, total_essays: totalEssays, weekly_practices: weeklyPractices, score_history: practiceHistory, top_errors: topErrors.map(([t, c]) => ({ type: t, count: c })), continuous_days: user.continuous_days || 0 });
}