import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/db';
import { getUserFromToken } from '@/lib/server/helpers';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ detail: '未登录' }, { status: 401 });
  
  const { id } = await params;
  const db = readDb();
  const sentence = db.sentences.find(s => s.id === parseInt(id));
  if (!sentence) return NextResponse.json({ detail: 'Sentence not found' }, { status: 404 });
  return NextResponse.json(sentence);
}
