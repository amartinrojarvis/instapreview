import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import path from "node:path";
import { requireAuth } from "@/lib/auth";
import { ensureUploadRoot, clientPostDir } from "@/lib/storage";

export const runtime = "nodejs";

function extFromMime(mime: string | null) {
  if (!mime) return "";
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "video/mp4") return ".mp4";
  if (mime === "video/quicktime") return ".mov";
  return "";
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  ensureUploadRoot();
  const form = await req.formData();
  const clientSlug = String(form.get("clientSlug") || "").trim();
  const postId = String(form.get("postId") || "").trim();
  const type = String(form.get("type") || "").trim();

  if (!clientSlug || !postId) {
    return NextResponse.json({ error: "Missing clientSlug/postId" }, { status: 400 });
  }

  const dir = clientPostDir(clientSlug, postId);
  fs.mkdirSync(dir, { recursive: true });

  const files = form.getAll("files").filter(Boolean) as unknown as File[];
  if (!files.length) {
    const single = form.get("file") as unknown as File | null;
    if (single) files.push(single);
  }

  if (!files.length) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }

  // Simple limits
  if (type === "carousel" && files.length > 10) {
    return NextResponse.json({ error: "Carousel max 10 images" }, { status: 400 });
  }

  const saved: { filePath: string; fileUrl: string }[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const mime = file.type;
    const size = file.size;

    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");

    if (isImage && size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Image too large (10MB max)" }, { status: 400 });
    }
    if (isVideo && size > 100 * 1024 * 1024) {
      return NextResponse.json({ error: "Video too large (100MB max)" }, { status: 400 });
    }

    let filename = "";
    if (type === "video") {
      filename = `video${extFromMime(mime) || ".mp4"}`;
    } else {
      const ext = extFromMime(mime) || path.extname(file.name) || ".jpg";
      filename = `${i + 1}${ext}`;
    }

    const abs = path.join(dir, filename);
    const buf = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(abs, buf);

    const rel = path.posix.join(clientSlug, postId, filename);
    saved.push({
      filePath: rel,
      fileUrl: `/api/public/media/${encodeURI(rel)}`,
    });
  }

  return NextResponse.json({ files: saved });
}
