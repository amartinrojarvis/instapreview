import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const db = getDb();
  const clients = db
    .prepare(
      `SELECT c.*, (SELECT COUNT(1) FROM posts p WHERE p.client_id = c.id) as posts_count
       FROM clients c ORDER BY c.created_at DESC`
    )
    .all();
  return NextResponse.json({ clients });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = (body?.name || "").trim();
  const slug = (body?.slug || "").trim();
  const description = (body?.description || "").trim();

  if (!name || !slug) {
    return NextResponse.json({ error: "Missing name/slug" }, { status: 400 });
  }

  const db = getDb();
  const id = uuidv4();

  try {
    db.prepare(
      `INSERT INTO clients (id, name, slug, description, created_at, updated_at)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    ).run(id, name, slug, description || null);
  } catch (e: any) {
    if (String(e?.message || "").includes("UNIQUE")) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    throw e;
  }

  const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(id);
  return NextResponse.json({ client }, { status: 201 });
}
