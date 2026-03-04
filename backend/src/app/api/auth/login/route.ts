import { NextRequest, NextResponse } from "next/server";
import { assertEnv, env } from "@/lib/env";
import { signToken, tokenCookie } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    assertEnv();
  } catch (e: any) {
    return NextResponse.json({ error: "Env check failed", details: e.message }, { status: 500 });
  }
  
  const body = await req.json().catch(() => null);
  const password = body?.password;
  if (!password) {
    return NextResponse.json({ error: "Missing password" }, { status: 400 });
  }
  if (password !== env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }
  const token = signToken();
  const res = NextResponse.json({ token, expiresIn: 60 * 60 * 24 * 7 });
  res.headers.set("Set-Cookie", tokenCookie(token));
  return res;
}
