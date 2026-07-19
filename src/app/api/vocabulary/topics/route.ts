import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/server/db";

export async function GET() {
  const topics = [...new Set(readDb().vocabulary.map(v => v.topic))].filter(Boolean);
  return NextResponse.json(topics);
}
