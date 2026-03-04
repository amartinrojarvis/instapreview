import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

// This endpoint now redirects to the Supabase Storage public URL
// Keeping it for backward compatibility with existing URLs
export async function GET(_req: NextRequest, { params }: { params: { path: string[] } }) {
  const rel = params.path.join("/");
  
  // Get public URL from Supabase Storage
  const { data: { publicUrl } } = supabase
    .storage
    .from('posts')
    .getPublicUrl(rel)

  // Redirect to the public URL
  return NextResponse.redirect(publicUrl, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
