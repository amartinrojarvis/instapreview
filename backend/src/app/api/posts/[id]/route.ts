import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabase, handleSupabaseError } from "@/lib/supabase";
import { removePostStorage } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { data: post, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ post });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json().catch(() => null);
  const caption = body?.caption != null ? String(body.caption).trim() : null;
  const hashtags = body?.hashtags != null ? String(body.hashtags).trim() : null;
  const likesCount = body?.likes_count != null ? Number(body.likes_count) : null;
  const position = body?.position != null ? Number(body.position) : null;

  // Get existing post
  const { data: existing, error: fetchError } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (fetchError || !existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const newPosition = position ?? existing.position;
  if (!Number.isInteger(newPosition) || newPosition < 1 || newPosition > 4) {
    return NextResponse.json({ error: "Invalid position" }, { status: 400 });
  }

  const updates: any = {
    position: newPosition,
  }

  if (caption !== null) {
    updates.caption = caption || null
  }
  if (hashtags !== null) {
    updates.hashtags = hashtags || null
  }
  if (likesCount !== null) {
    updates.likes_count = likesCount
  }

  const { data: post, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: "Position already used" }, { status: 409 });
    }
    return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 });
  }

  return NextResponse.json({ post });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  // Get post info before deleting (for storage cleanup)
  const { data: post } = await supabase
    .from('posts')
    .select('storage_path')
    .eq('id', params.id)
    .single()

  if (!post) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 });
  }

  // Clean up storage
  await removePostStorage(post.storage_path);

  return NextResponse.json({ ok: true });
}
