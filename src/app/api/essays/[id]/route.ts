import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/server/db";

export async function GET(req: NextRequest, { params }: any) {
  const { id } = await params;
  const essay = readDb().essays.find(e => e.id === parseInt(id));
  if (!essay) return NextResponse.json({ detail: "Not found" }, { status: 404 });
  return NextResponse.json(essay);
}
