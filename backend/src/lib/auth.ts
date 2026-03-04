import jwt from "jsonwebtoken";
import { env } from "@/lib/env";
import { NextRequest } from "next/server";

export type AuthPayload = {
  sub: string; // admin
};

const TOKEN_COOKIE = "instapreview_token";

export function signToken() {
  const token = jwt.sign({ sub: "admin" } satisfies AuthPayload, env.JWT_SECRET, {
    expiresIn: "7d",
  });
  return token;
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, env.JWT_SECRET) as AuthPayload;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice("Bearer ".length);
  const cookie = req.cookies.get(TOKEN_COOKIE)?.value;
  return cookie || null;
}

export function requireAuth(req: NextRequest) {
  const token = getTokenFromRequest(req);
  if (!token) return { ok: false as const, error: "Missing token" };
  try {
    const payload = verifyToken(token);
    return { ok: true as const, payload };
  } catch {
    return { ok: false as const, error: "Invalid token" };
  }
}

export function tokenCookie(token: string) {
  // not httpOnly so middleware + client can read if needed; acceptable for this simple internal tool
  return `${TOKEN_COOKIE}=${token}; Path=/; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`;
}

export function clearTokenCookie() {
  return `${TOKEN_COOKIE}=; Path=/; Max-Age=0`;
}

export const tokenCookieName = TOKEN_COOKIE;
