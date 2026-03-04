import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ ok: false }, { status: 401 });
  return NextResponse.json({ ok: true, sub: auth.payload.sub });
}
