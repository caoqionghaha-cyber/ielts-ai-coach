import { NextRequest } from "next/server";
import { readDb } from "@/lib/server/db";
import { verifyToken } from "@/lib/server/auth";
import { seedEssays, seedVocabulary, seedIdeas, seedSentences } from "@/lib/server/db";

export function getUserFromToken(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) return null;
  const payload = verifyToken(auth.slice(7));
  if (!payload || !payload.user_id) return null;
  const db = readDb();
  return db.users.find(u => u.id === payload.user_id) || null;
}

export function ensureSeeded() {
  seedSentences();
  seedEssays();
  seedVocabulary();
  seedIdeas();
}