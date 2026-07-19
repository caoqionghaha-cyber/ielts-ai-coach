import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";

export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  const { question } = await req.json();
  const db = readDb();
  const id = ++db.counters.essay_practices;
  db.essay_practices.push({
    id, user_id: user?.id || 0, question: question || "", content: "", word_count: 0,
    submitted: false, task_response: 0, coherence: 0, lexical_resource: 0,
    grammar: 0, overall: 0, feedback: "", suggestions: "",
    created_time: new Date().toISOString(),
  });
  return NextResponse.json({ id, question });
}
