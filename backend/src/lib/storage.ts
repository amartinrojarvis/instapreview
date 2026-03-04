import { supabase } from "./supabase";

export async function removeClientStorage(clientSlug: string) {
  try {
    // List all files in the client folder
    const { data: files } = await supabase
      .storage
      .from('posts')
      .list(clientSlug)

    if (files && files.length > 0) {
      // Delete all files in the client folder
      const filePaths = files.map((f: { name: string }) => `${clientSlug}/${f.name}`)
      await supabase.storage.from('posts').remove(filePaths)
    }
  } catch (error) {
    console.error('Error removing client storage:', error)
  }
}

export async function removePostStorage(storagePath: string) {
  try {
    // List all files in the post folder
    const { data: files } = await supabase
      .storage
      .from('posts')
      .list(storagePath)

    if (files && files.length > 0) {
      // Delete all files in the post folder
      const filePaths = files.map((f: { name: string }) => `${storagePath}/${f.name}`)
      await supabase.storage.from('posts').remove(filePaths)
    }
  } catch (error) {
    console.error('Error removing post storage:', error)
  }
}

// Legacy functions - kept for compatibility but no-op
export function ensureUploadRoot() {
  // No-op: Supabase Storage handles this
}

export function clientPostDir(clientSlug: string, postId: string): string {
  return `${clientSlug}/${postId}`;
}

export function safeJoin(root: string, rel: string): string {
  // Simple path validation - prevents directory traversal
  if (rel.includes('..')) {
    throw new Error("Invalid path");
  }
  return rel;
}

export function removeDirRecursive(_dirPath: string) {
  // No-op: Use removePostStorage or removeClientStorage instead
  void _dirPath; // Mark as intentionally unused
}
