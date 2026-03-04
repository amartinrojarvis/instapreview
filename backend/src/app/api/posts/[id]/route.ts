import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { env } from "@/lib/env";
import { removeDirRecursive } from "@/lib/storage";
import path from "node:path";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });
  const db = getDb();
  const post = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(params.id);
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json().catch(() => null);
  const caption = body?.caption != null ? String(body.caption).trim() : null;
  const hashtags = body?.hashtags != null ? String(body.hashtags).trim() : null;
  const likesCount = body?.likes_count != null ? Number(body.likes_count) : null;
  const position = body?.position != null ? Number(body.position) : null;

  const db = getDb();
  const existing = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(params.id) as any;
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const newPosition = position ?? existing.position;
  if (!Number.isInteger(newPosition) || newPosition < 1 || newPosition > 4) {
    return NextResponse.json({ error: "Invalid position" }, { status: 400 });
  }

  try {
    db.prepare(
      `UPDATE posts SET caption=?, hashtags=?, likes_count=COALESCE(?, likes_count), position=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
    ).run(
      caption === null ? existing.caption : caption || null,
      hashtags === null ? existing.hashtags : hashtags || null,
      likesCount,
      newPosition,
      params.id
    );
  } catch (e: any) {
    if (String(e?.message || "").includes("UNIQUE")) {
      return NextResponse.json({ error: "Position already used" }, { status: 409 });
    }
    throw e;
  }

  const post = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(params.id);
  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });
  const db = getDb();
  const post = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(params.id) as any;
  if (!post) return NextResponse.json({ error: "Not found" }, { status: 404 });

  removeDirRecursive(path.join(env.UPLOAD_DIR, post.storage_path));
  db.prepare(`DELETE FROM posts WHERE id = ?`).run(params.id);
  return NextResponse.json({ ok: true });
}
