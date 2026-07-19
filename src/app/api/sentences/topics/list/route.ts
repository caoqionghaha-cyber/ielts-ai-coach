import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/db';

export async function GET(_req: NextRequest) {
  const db = readDb();
  const topics = [...new Set(db.sentences.filter(s => s.topic).map(s => s.topic))];
  return NextResponse.json(topics);
}
