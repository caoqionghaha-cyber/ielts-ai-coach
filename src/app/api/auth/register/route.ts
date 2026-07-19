import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/server/db";
import { hashPassword, createToken } from "@/lib/server/auth";
import { seedSentences, seedEssays, seedVocabulary, seedIdeas } from "@/lib/server/db";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password || username.length < 2 || password.length < 3) {
      return NextResponse.json({ detail: "用户名至少2个字符，密码至少3个字符" }, { status: 400 });
    }
    let db = readDb();
    seedSentences(); seedEssays(); seedVocabulary(); seedIdeas();
    
    if (db.users.find(u => u.username === username)) {
      return NextResponse.json({ detail: "用户名已存在" }, { status: 400 });
    }
    
    const hashed = hashPassword(password);
    db.counters.users++;
    const user = {
      id: db.counters.users,
      email: username + "@demo.com",
      username,
      hashed_password: hashed,
      target_band: 7.0,
      current_band: 0,
      continuous_days: 0,
      created_time: new Date().toISOString()
    };
    db.users.push(user);
    
    const token = createToken({ user_id: user.id, username: user.username });
    return NextResponse.json({ access_token: token, token_type: "bearer" });
  } catch {
    return NextResponse.json({ detail: "请求无效" }, { status: 400 });
  }
}
