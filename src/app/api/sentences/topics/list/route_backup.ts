import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/db';
import { getUserFromToken } from '@/lib/server/helpers';

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ detail: '未登录' }, { status: 401 });
  
  const db = readDb();
  const topics = [...new Set(db.sentences.filter(s => s.topic).map(s => s.topic))];
  return NextResponse.json(topics);
}
