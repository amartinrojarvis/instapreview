import { NextRequest, NextResponse } from "next/server";
import { supabase, handleSupabaseError } from "@/lib/supabase";
import { withCors, corsOptionsResponse } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientSlug = searchParams.get("clientSlug");
  if (!clientSlug) return withCors(NextResponse.json({ error: "Missing clientSlug" }, { status: 400 }));

  // Get client by slug
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', clientSlug)
    .single()

  if (clientError || !client) {
    return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));
  }

  // Get posts with their storage files
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('client_id', client.id)
    .order('position', { ascending: true })

  if (postsError) {
    return withCors(NextResponse.json({ error: handleSupabaseError(postsError) }, { status: 500 }));
  }

  // Get public URLs for all post files from Supabase Storage
  const postsWithFiles = await Promise.all(
    (posts || []).map(async (post: any) => {
      const { data: files } = await supabase
        .storage
        .from('posts')
        .list(post.storage_path)

      let fileUrls: string[] = []
      
      if (files && files.length > 0) {
        if (post.type === 'video') {
          // For video, find video files
          const videoFile = files.find((f: any) => 
            f.name.toLowerCase().startsWith('video.')
          )
          if (videoFile) {
            const { data: { publicUrl } } = supabase
              .storage
              .from('posts')
              .getPublicUrl(`${post.storage_path}/${videoFile.name}`)
            fileUrls = [publicUrl]
          }
        } else {
          // For images, get all image files sorted
          const imageFiles = files
            .filter((f: any) => /\.(jpg|jpeg|png|webp)$/i.test(f.name))
            .sort((a: any, b: any) => {
              // Sort numerically (1.jpg, 2.jpg, etc.)
              const numA = parseInt(a.name.match(/^\d+/)?.[0] || '0')
              const numB = parseInt(b.name.match(/^\d+/)?.[0] || '0')
              return numA - numB
            })
          
          fileUrls = imageFiles.map((f: any) => {
            const { data: { publicUrl } } = supabase
              .storage
              .from('posts')
              .getPublicUrl(`${post.storage_path}/${f.name}`)
            return publicUrl
          })
        }
      }

      return { ...post, files: fileUrls }
    })
  )

  return withCors(NextResponse.json({ client, posts: postsWithFiles }));
}
