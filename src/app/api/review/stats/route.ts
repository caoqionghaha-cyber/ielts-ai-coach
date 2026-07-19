import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ total_scheduled: 0, pending_reviews: 0 });
  const db = readDb();
  const now = new Date().toISOString();
  return NextResponse.json({ total_scheduled: db.reviews.filter(r => r.user_id === user.id).length, pending_reviews: db.reviews.filter(r => r.user_id === user.id && r.next_review_time <= now).length });
}