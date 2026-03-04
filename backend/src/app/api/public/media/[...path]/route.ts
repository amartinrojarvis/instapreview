import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";
import { safeJoin } from "@/lib/storage";

export const runtime = "nodejs";

function contentTypeFromExt(ext: string) {
  switch (ext.toLowerCase()) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".webp":
      return "image/webp";
    case ".mp4":
      return "video/mp4";
    case ".mov":
      return "video/quicktime";
    default:
      return "application/octet-stream";
  }
}

export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const rel = params.path.join("/");
  const abs = safeJoin(env.UPLOAD_DIR, rel);
  if (!fs.existsSync(abs)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const stat = fs.statSync(abs);
  if (!stat.isFile()) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const ext = path.extname(abs);
  const buf = fs.readFileSync(abs);
  return new NextResponse(buf, {
    headers: {
      "Content-Type": contentTypeFromExt(ext),
      "Cache-Control": "public, max-age=3600",
    },
  });
}
