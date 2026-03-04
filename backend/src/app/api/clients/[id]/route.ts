import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { getDb } from "@/lib/db";
import { removeDirRecursive } from "@/lib/storage";
import { env } from "@/lib/env";
import path from "node:path";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });
  const db = getDb();
  const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(params.id);
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ client });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
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
  try {
    const r = db
      .prepare(
        `UPDATE clients SET name=?, slug=?, description=?, updated_at=CURRENT_TIMESTAMP WHERE id=?`
      )
      .run(name, slug, description || null, params.id);
    if (r.changes === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  } catch (e: any) {
    if (String(e?.message || "").includes("UNIQUE")) {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    throw e;
  }
  const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(params.id);
  return NextResponse.json({ client });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const db = getDb();
  const client = db.prepare(`SELECT * FROM clients WHERE id = ?`).get(params.id) as any;
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // remove uploads folder for client
  const clientDir = path.join(env.UPLOAD_DIR, client.slug);
  removeDirRecursive(clientDir);

  db.prepare(`DELETE FROM clients WHERE id = ?`).run(params.id);
  return NextResponse.json({ ok: true });
}
