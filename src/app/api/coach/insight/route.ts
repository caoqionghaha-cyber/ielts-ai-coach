import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/server/db";
import { getUserFromToken, ensureSeeded } from "@/lib/server/helpers";

export async function GET(req: NextRequest) {
  ensureSeeded();
  const user = getUserFromToken(req);
  const db = readDb();
  const now = new Date();

  if (!user) {
    return NextResponse.json({
      grammar_remaining: 0, grammar_progress: 0,
      vocabulary_remaining: 0, vocabulary_progress: 0,
      collocation_remaining: 0, collocation_progress: 0,
      insight_text: "开始练习后，AI教练将为你分析学习数据。",
      suggestion_text: "完成一些句子翻译练习，积累学习数据。",
      score_trend: 0,
    });
  }

  const pendingReviews = db.reviews.filter(r => r.user_id === user.id && r.next_review_time <= now.toISOString());
  const userErrors = db.errors.filter(e => e.user_id === user.id);
  
  const grammarErrors = userErrors.filter(e => ["Grammar","Article","Tense","Plural"].includes(e.error_type));
  const vocabErrors = userErrors.filter(e => e.error_type === "Vocabulary");
  const collocationErrors = userErrors.filter(e => e.error_type === "Collocation");

  const grammarRemaining = Math.max(0, grammarErrors.length);
  const vocabRemaining = Math.max(0, vocabErrors.length);
  const collocationRemaining = Math.max(0, collocationErrors.length);

  const userPractices = db.practices.filter(p => p.user_id === user.id).sort((a,b) => new Date(a.practice_time).getTime() - new Date(b.practice_time).getTime());
  const recentPractices = userPractices.slice(-10);
  const olderPractices = userPractices.slice(0, Math.max(1, userPractices.length - 10));
  const recentAvg = recentPractices.length ? recentPractices.reduce((s,p) => s+p.score,0)/recentPractices.length : 0;
  const olderAvg = olderPractices.length ? olderPractices.reduce((s,p) => s+p.score,0)/olderPractices.length : 0;
  const scoreTrend = olderAvg > 0 ? Math.round(((recentAvg-olderAvg)/olderAvg)*100) : 0;

  const totalPractices = userPractices.length;
  const totalGrammar = grammarErrors.reduce((s,e) => s+e.count, 0);
  const totalVocab = vocabErrors.reduce((s,e) => s+e.count, 0);
  const totalCollocation = collocationErrors.reduce((s,e) => s+e.count, 0);

  let insightText = "";
  if (totalPractices === 0) {
    insightText = "开始你的第一次练习，AI教练将为你分析学习数据。";
  } else {
    insightText = `本周已完成 ${totalPractices} 次练习`;
    if (scoreTrend > 0) insightText += `，平均分提升 ${scoreTrend}%。继续加油！`;
    else if (scoreTrend < 0) insightText += `，平均分下降 ${Math.abs(scoreTrend)}%。建议加强薄弱环节。`;
    else insightText += `，保持稳定。继续努力！`;

    if (totalGrammar > totalVocab && totalGrammar > totalCollocation) insightText += " 语法错误最多，建议重点练习冠词和时态。";
    else if (totalVocab > totalGrammar && totalVocab > totalCollocation) insightText += " 词汇错误最多，建议积累话题词汇和同义替换。";
    else if (totalCollocation > 0) insightText += " 搭配错误较多，建议多记忆固定搭配。";
    else insightText += " 继续拓展不同话题的高分表达。";
  }

  let suggestionText = "";
  if (grammarErrors.length || vocabErrors.length || collocationErrors.length) {
    const allErr = [...grammarErrors, ...vocabErrors, ...collocationErrors].sort((a,b) => b.count - a.count);
    const top = allErr[0];
    suggestionText = `重点纠正常见错误：将「${top.wrong}」改为「${top.correct}」（已出现 ${top.count} 次）。`;
  } else {
    suggestionText = "阅读一篇范文，练习写一个主体段，尝试使用至少 5 个高级连接词。";
  }

  return NextResponse.json({
    grammar_remaining: grammarRemaining,
    grammar_progress: grammarRemaining > 0 ? Math.min(100, Math.round((1 - pendingReviews.filter(r => r.content_type==="practice").length / Math.max(1, grammarRemaining + pendingReviews.filter(r => r.content_type==="practice").length))*100)) : 0,
    vocabulary_remaining: vocabRemaining,
    vocabulary_progress: vocabRemaining > 0 ? Math.min(100, Math.round((1 - pendingReviews.filter(r => r.content_type==="error").length / Math.max(1, vocabRemaining + pendingReviews.filter(r => r.content_type==="error").length))*100)) : 0,
    collocation_remaining: collocationRemaining,
    collocation_progress: collocationRemaining > 0 ? Math.min(100, Math.round(50)) : 0,
    insight_text: insightText,
    suggestion_text: suggestionText,
    score_trend: scoreTrend,
    total_practices: totalPractices,
  });
}
