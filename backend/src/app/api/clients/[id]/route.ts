import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabase, handleSupabaseError } from "@/lib/supabase";
import { removeClientStorage } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ client });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = (body?.name || "").trim();
  const slug = (body?.slug || "").trim();
  const description = (body?.description || "").trim();

  if (!name || !slug) {
    return NextResponse.json({ error: "Missing name/slug" }, { status: 400 });
  }

  const { data: client, error } = await supabase
    .from('clients')
    .update({
      name,
      slug,
      description: description || null
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 });
  }

  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ client });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  // Get client info before deleting (for storage cleanup)
  const { data: client } = await supabase
    .from('clients')
    .select('slug')
    .eq('id', params.id)
    .single()

  if (!client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Delete client (posts will cascade delete via FK constraint)
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 });
  }

  // Clean up storage
  await removeClientStorage(client.slug);

  return NextResponse.json({ ok: true });
}
