import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json([]);
  const errors = readDb().errors.filter(e => e.user_id === user.id);
  const byType: Record<string, number> = {};
  errors.forEach(e => { byType[e.error_type] = (byType[e.error_type] || 0) + e.count; });
  return NextResponse.json(Object.entries(byType).map(([type, count]) => ({ type, count })));
}