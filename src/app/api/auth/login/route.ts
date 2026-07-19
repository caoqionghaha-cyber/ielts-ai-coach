import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/server/db";
import { hashPassword, verifyPassword, createToken, verifyToken } from "@/lib/server/auth";
import { seedSentences, seedEssays, seedVocabulary, seedIdeas } from "@/lib/server/db";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    let db = readDb();
    
    // Seed data on first use
    seedSentences();
    seedEssays();
    seedVocabulary();
    seedIdeas();
    
    // Find or create user
    let user = db.users.find(u => u.username === username);
    if (!user) {
      // Auto-create user for demo purposes (Vercel has no persistent storage)
      const hashed = hashPassword(password);
      db.counters.users++;
      user = {
        id: db.counters.users,
        email: username + "@demo.com",
        username: username,
        hashed_password: hashed,
        target_band: 7.0,
        current_band: 0,
        continuous_days: 0,
        created_time: new Date().toISOString()
      };
      db.users.push(user);
    } else {
      if (!verifyPassword(password, user.hashed_password)) {
        return NextResponse.json({ detail: "用户名或密码错误" }, { status: 401 });
      }
    }
    
    const token = createToken({ user_id: user.id, username: user.username });
    return NextResponse.json({ access_token: token, token_type: "bearer" });
  } catch {
    return NextResponse.json({ detail: "请求无效" }, { status: 400 });
  }
}
