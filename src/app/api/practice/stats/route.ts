import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/db';
import { getUserFromToken } from '@/lib/server/helpers';

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ detail: '未登录' }, { status: 401 });
  
  const db = readDb();
  const { searchParams } = new URL(req.url);
  const days = parseInt(searchParams.get('days') || '7');
  
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
  const practices = db.practices.filter(
    p => p.user_id === user.id && p.practice_time >= cutoff
  );
  
  const total = practices.length;
  const avgScore = total > 0 ? practices.reduce((s, p) => s + p.score, 0) / total : 0;
  
  return NextResponse.json({
    total_practices: total,
    average_score: Math.round(avgScore * 10) / 10,
    days,
  });
}
