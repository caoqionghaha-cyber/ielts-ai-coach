import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/server/db";
import { getUserFromToken } from "@/lib/server/helpers";
import { gradeEssay } from "@/lib/server/ai";

export async function POST(req: NextRequest) {
  const user = getUserFromToken(req);
  const { id, content } = await req.json();
  const db = readDb();
  const practice = db.essay_practices.find(p => p.id === id && (user ? p.user_id === user.id : p.user_id === 0));
  if (!practice) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  practice.content = content;
  practice.word_count = content.split(/\s+/).length;
  practice.submitted = true;
  const score = gradeEssay(content, practice.question);
  practice.task_response = score.task_response;
  practice.coherence = score.coherence;
  practice.lexical_resource = score.lexical_resource;
  practice.grammar = score.grammar;
  practice.overall = score.overall;
  practice.feedback = score.feedback;
  practice.suggestions = score.suggestions.join("||");
  writeDb(db);
  return NextResponse.json({
    id: practice.id, word_count: practice.word_count,
    task_response: practice.task_response, coherence: practice.coherence,
    lexical_resource: practice.lexical_resource, grammar: practice.grammar,
    overall: practice.overall, feedback: practice.feedback,
    suggestions: score.suggestions,
  });
}
