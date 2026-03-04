import fs from "node:fs";
import path from "node:path";
import { env } from "@/lib/env";

export function ensureUploadRoot() {
  fs.mkdirSync(env.UPLOAD_DIR, { recursive: true });
}

export function clientPostDir(clientSlug: string, postId: string) {
  return path.join(env.UPLOAD_DIR, clientSlug, postId);
}

export function safeJoin(root: string, rel: string) {
  const resolved = path.resolve(root, rel);
  const resolvedRoot = path.resolve(root);
  if (!resolved.startsWith(resolvedRoot + path.sep) && resolved !== resolvedRoot) {
    throw new Error("Invalid path");
  }
  return resolved;
}

export function removeDirRecursive(dirPath: string) {
  if (!fs.existsSync(dirPath)) return;
  fs.rmSync(dirPath, { recursive: true, force: true });
}
