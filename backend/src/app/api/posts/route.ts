import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabase, handleSupabaseError } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("clientId");
  if (!clientId) return NextResponse.json({ error: "Missing clientId" }, { status: 400 });

  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .eq('client_id', clientId)
    .order('position', { ascending: true })

  if (error) {
    return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 });
  }

  return NextResponse.json({ posts: posts || [] });
}

export async function POST(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json().catch(() => null);
  const clientId = body?.client_id;
  const type = body?.type;
  const position = Number(body?.position);
  const caption = (body?.caption || "").trim();
  const hashtags = (body?.hashtags || "").trim();
  const likesCount = body?.likes_count != null ? Number(body.likes_count) : 0;
  const fileCount = body?.file_count != null ? Number(body.file_count) : 1;

  if (!clientId || !["single", "carousel", "video"].includes(type)) {
    return NextResponse.json({ error: "Invalid client_id/type" }, { status: 400 });
  }
  if (!Number.isInteger(position) || position < 1 || position > 4) {
    return NextResponse.json({ error: "Invalid position (1-4)" }, { status: 400 });
  }
  if (!Number.isInteger(fileCount) || fileCount < 1 || fileCount > 10) {
    return NextResponse.json({ error: "Invalid file_count" }, { status: 400 });
  }

  // Verify client exists
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('slug')
    .eq('id', clientId)
    .single()

  if (clientError || !client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  // Check max 4 posts per client
  const { count, error: countError } = await supabase
    .from('posts')
    .select('*', { count: 'exact', head: true })
    .eq('client_id', clientId)

  if (countError) {
    return NextResponse.json({ error: handleSupabaseError(countError) }, { status: 500 });
  }

  if ((count || 0) >= 4) {
    return NextResponse.json({ error: "Max 4 posts per client" }, { status: 409 });
  }

  // Create storage path
  const storagePath = `${client.slug}/${crypto.randomUUID()}`;

  const { data: post, error } = await supabase
    .from('posts')
    .insert({
      client_id: clientId,
      type,
      position,
      caption: caption || null,
      hashtags: hashtags || null,
      likes_count: likesCount || 0,
      file_count: fileCount,
      storage_path: storagePath
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: "Position already used" }, { status: 409 });
    }
    return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 });
  }

  return NextResponse.json({ post }, { status: 201 });
}
