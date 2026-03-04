import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 });

  const db = getDb();
  const posts = db
    .prepare(`SELECT * FROM posts WHERE client_id = ? ORDER BY position ASC`)
    .all(clientId);
  return NextResponse.json({ posts });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json().catch(() => null);
  const clientId = body?.client_id;
  const type = body?.type;
  const position = Number(body?.position);
  const caption = (body?.caption || "").trim();
  const hashtags = (body?.hashtags || "").trim();
  const likesCount = body?.likes_count != null ? Number(body.likes_count) : 0;
  const fileCount = body?.file_count != null ? Number(body.file_count) : 1;

  if (!clientId || !["single", "carousel", "video"].includes(type)) {
    return NextResponse.json({ error: "Invalid client_id/type" }, { status: 400 });
  }
  if (!Number.isInteger(position) || position < 1 || position > 4) {
    return NextResponse.json({ error: "Invalid position (1-4)" }, { status: 400 });
  }
  if (!Number.isInteger(fileCount) || fileCount < 1 || fileCount > 10) {
    return NextResponse.json({ error: "Invalid file_count" }, { status: 400 });
  }

  const db = getDb();
  const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(clientId) as any;
  if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

  // enforce max 4 posts
  const count = db.prepare(`SELECT COUNT(1) as c FROM posts WHERE client_id=?`).get(clientId) as any;
  if ((count?.c || 0) >= 4) {
    return NextResponse.json({ error: "Max 4 posts per client" }, { status: 409 });
  }

  const id = uuidv4();
  const storagePath = `${client.slug}/${id}`; // relative to UPLOAD_DIR

  try {
    db.prepare(
      `INSERT INTO posts (id, client_id, type, position, caption, hashtags, likes_count, file_count, storage_path, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).run(
      id,
      clientId,
      type,
      position,
      caption || null,
      hashtags || null,
      likesCount || 0,
      fileCount,
      storagePath
    );
  } catch (e: any) {
    if (String(e?.message || "").includes("UNIQUE")) {
      return NextResponse.json({ error: "Position already used" }, { status: 409 });
    }
    throw e;
  }

  const post = db.prepare(`SELECT * FROM posts WHERE id = ?`).get(id);
  return NextResponse.json({ post }, { status: 201 });
}
