import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import fs from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientSlug = searchParams.get("clientSlug");
  if (!clientSlug) return NextResponse.json({ error: "Missing clientSlug" }, { status: 400 });

  const db = getDb();
  const client = db.prepare(`SELECT * FROM clients WHERE slug = ?`).get(clientSlug) as any;
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const posts = (db
    .prepare(`SELECT * FROM posts WHERE client_id = ? ORDER BY position ASC`)
    .all(client.id) as any[]).map((p) => {
    const base = `/api/public/media/${encodeURI(p.storage_path)}/`;
    const dir = path.join(env.UPLOAD_DIR, p.storage_path);

    let files: string[] = [];
    if (fs.existsSync(dir)) {
      const names = fs
        .readdirSync(dir)
        .filter((n) => !n.startsWith("."))
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      if (p.type === "video") {
        files = names
          .filter((n) => n.toLowerCase().startsWith("video."))
          .map((n) => `${base}${encodeURI(n)}`);
      } else {
        files = names
          .filter((n) => /\.(jpg|jpeg|png|webp)$/i.test(n))
          .map((n) => `${base}${encodeURI(n)}`);
      }
    }

    return { ...p, files };
  });

  return NextResponse.json({ client, posts });
}
