import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/server/db';
import { getUserFromToken } from '@/lib/server/helpers';

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ detail: '未登录' }, { status: 401 });
  
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const quality = parseInt(searchParams.get('score') || '3');
  
  const db = readDb();
  const review = db.reviews.find(r => r.id === parseInt(id) && r.user_id === user.id);
  if (!review) return NextResponse.json({ detail: 'Review not found' }, { status: 404 });
  
  // SM-2 algorithm
  let newMastery: number;
  let nextReview: Date;
  
  if (quality < 3) {
    newMastery = Math.max(0, review.mastery - 2);
    nextReview = new Date(Date.now() + 10 * 60 * 1000);
  } else {
    newMastery = Math.min(5, review.mastery + 1);
    const intervals = [10 * 60 * 1000, 60 * 60 * 1000, 4 * 60 * 60 * 1000, 24 * 60 * 60 * 1000, 3 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000];
    nextReview = new Date(Date.now() + (intervals[newMastery] || intervals[5]));
  }
  
  review.mastery = newMastery;
  review.review_count += 1;
  review.next_review_time = nextReview.toISOString();
  
  writeDb(db);
  
  return NextResponse.json({
    mastery: newMastery,
    next_review_time: nextReview.toISOString(),
    message: 'Review completed',
  });
}
