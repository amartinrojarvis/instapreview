import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Lazy initialization - no falla en build time
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase environment variables. Check NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    }
    supabaseClient = createClient<any>(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return supabaseClient
}

// Export for backwards compatibility (lazy)
export const supabase = new Proxy({} as ReturnType<typeof createClient>, {
  get(target, prop) {
    return getSupabaseClient()[prop as keyof typeof target]
  }
})

// Types for database tables
export type Client = {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
  updated_at: string
}

export type Post = {
  id: string
  client_id: string
  type: 'single' | 'carousel' | 'video'
  position: number
  caption: string | null
  hashtags: string | null
  likes_count: number
  file_count: number
  storage_path: string
  created_at: string
  updated_at: string
}

// Helper to handle Supabase errors
export function handleSupabaseError(error: any): string {
  if (error?.code === '23505') {
    return 'Duplicate entry - already exists'
  }
  if (error?.code === '23503') {
    return 'Referenced record not found'
  }
  return error?.message || 'Database error'
}
