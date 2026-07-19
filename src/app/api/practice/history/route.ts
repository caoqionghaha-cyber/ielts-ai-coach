import { NextRequest, NextResponse } from 'next/server';
import { readDb } from '@/lib/server/db';
import { getUserFromToken } from '@/lib/server/helpers';

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  
  const db = readDb();
  const { searchParams } = new URL(req.url);
  const skip = parseInt(searchParams.get('skip') || '0');
  const limit = parseInt(searchParams.get('limit') || '50');
  const sentenceId = searchParams.get('sentence_id') ? parseInt(searchParams.get('sentence_id')!) : null;
  
  let userPractices = db.practices
    .filter(p => !user || p.user_id === user.id)
    .filter(p => !sentenceId || p.sentence_id === sentenceId)
    .sort((a, b) => new Date(b.practice_time).getTime() - new Date(a.practice_time).getTime())
    .slice(skip, skip + limit);
  
  const result = userPractices.map(p => {
    const sentence = db.sentences.find(s => s.id === p.sentence_id);
    const feedback = db.feedbacks.find(f => f.practice_id === p.id);
    return {
      id: p.id,
      sentence_id: p.sentence_id,
      english: sentence?.english || '',
      chinese: sentence?.chinese || '',
      answer: p.answer,
      score: p.score,
      practice_time: p.practice_time,
      feedback: feedback?.feedback_json || null,
    };
  });
  
  return NextResponse.json(result);
}
