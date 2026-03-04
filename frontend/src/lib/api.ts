export const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export type PublicClient = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
};

export type PublicPost = {
  id: string;
  client_id: string;
  type: "single" | "carousel" | "video";
  position: number;
  caption: string | null;
  hashtags: string | null;
  likes_count: number;
  file_count: number;
  storage_path: string;
  created_at?: string;
  files: string[];
};

export async function fetchPublicFeed(clientSlug: string) {
  const res = await fetch(`${API_URL}/api/public/posts?clientSlug=${encodeURIComponent(clientSlug)}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to load feed (${res.status})`);
  return (await res.json()) as { client: PublicClient; posts: PublicPost[] };
}

export function downloadZipUrl(clientSlug: string) {
  return `${API_URL}/api/public/download/${encodeURIComponent(clientSlug)}`;
}
