import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/server/auth";

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return NextResponse.json({ detail: "Not authenticated" }, { status: 401 });
  }
  const payload = verifyToken(auth.slice(7));
  if (!payload || !payload.user_id) {
    return NextResponse.json({ detail: "Invalid token" }, { status: 401 });
  }
  return NextResponse.json({
    id: payload.user_id,
    username: payload.username,
    email: payload.username + "@demo.com"
  });
}
