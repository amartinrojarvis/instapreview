import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import archiver from "archiver";
import { PassThrough, Readable } from "node:stream";
import fs from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { clientSlug: string } }) {
  const db = getDb();
  const client = db.prepare(`SELECT * FROM clients WHERE slug = ?`).get(params.clientSlug) as any;
  if (!client) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const posts = db
    .prepare(`SELECT * FROM posts WHERE client_id = ? ORDER BY position ASC`)
    .all(client.id) as any[];

  const archive = archiver("zip", { zlib: { level: 9 } });
  const passthrough = new PassThrough();
  archive.pipe(passthrough);

  for (const p of posts) {
    const baseDir = path.join(env.UPLOAD_DIR, p.storage_path);
    if (fs.existsSync(baseDir)) {
      archive.directory(baseDir, `post_${p.position}_${p.id}`);
    }
    const captionText = `${client.slug}\n\n${p.caption || ""}\n\n${p.hashtags || ""}\n`;
    archive.append(captionText, { name: `post_${p.position}_${p.id}/caption.txt` });
  }

  archive.finalize();

  const webStream = Readable.toWeb(passthrough) as unknown as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=instapreview_${client.slug}.zip`,
    },
  });
}
