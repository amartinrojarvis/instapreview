// Legacy database types - now using Supabase
// See src/lib/supabase.ts for the new database client

export type Client = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  client_id: string;
  type: "single" | "carousel" | "video";
  position: number;
  caption: string | null;
  hashtags: string | null;
  likes_count: number;
  file_count: number;
  storage_path: string;
  created_at: string;
  updated_at: string;
};

// Deprecated: Use supabase from @/lib/supabase instead
export function getDb() {
  throw new Error('SQLite database is deprecated. Use Supabase client from @/lib/supabase instead');
}
