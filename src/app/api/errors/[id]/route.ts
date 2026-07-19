import { NextRequest, NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/server/db';
import { getUserFromToken } from '@/lib/server/helpers';

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ detail: '未登录' }, { status: 401 });
  
  const { id } = await params;
  const db = readDb();
  const index = db.errors.findIndex(e => e.id === parseInt(id) && e.user_id === user.id);
  if (index === -1) return NextResponse.json({ detail: 'Error not found' }, { status: 404 });
  
  db.errors.splice(index, 1);
  writeDb(db);
  return NextResponse.json({ message: 'Error deleted' });
}
