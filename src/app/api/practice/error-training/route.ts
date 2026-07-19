import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";

export async function GET(req: NextRequest) {
  const user = getUserFromToken(req);
  if (!user) return NextResponse.json({ detail: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(req.url);
  const errorType = searchParams.get("error_type");
  const count = parseInt(searchParams.get("count") || "5");
  const db = readDb();
  const related = db.errors.filter(e => e.user_id === user.id && (!errorType || e.error_type === errorType));
  const sentences = related.slice(0, count).map(e => ({
    chinese: "Correct this error: " + e.wrong,
    correct: e.correct,
    error_type: e.error_type,
  }));
  while (sentences.length < Math.min(count, 5)) {
    sentences.push({ chinese: "Practice using correct collocations in context.", correct: "Use appropriate vocabulary for IELTS writing.", error_type: "General" });
    if (sentences.length >= count) break;
  }
  return NextResponse.json({ sentences });
}
