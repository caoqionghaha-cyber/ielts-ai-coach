import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "@/lib/server/helpers";

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json([]);
  const { searchParams } = new URL(req.url);
  const errorType = searchParams.get("error_type");
  let items = (await import("@/lib/server/db")).readDb().errors.filter(e => e.user_id === user.id);
  if (errorType) items = items.filter(e => e.error_type === errorType);
  return NextResponse.json(items.sort((a, b) => b.count - a.count));
}