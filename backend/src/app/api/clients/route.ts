import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabase, handleSupabaseError } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const auth = requireAuth(req);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

  const { data: clients, error } = await supabase
    .from('clients')
    .select(`
      *,
      posts:posts(count)
    `)
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 })
  }

  // Transform posts count from array to number
  const clientsWithCount = clients?.map((c: any) => ({
    ...c,
    posts_count: c.posts?.[0]?.count || 0
  })) || []

  return NextResponse.json({ clients: clientsWithCount })
}

export async function POST(req: NextRequest) {
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
    .insert({
      name,
      slug,
      description: description || null
    })
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ error: "Slug already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: handleSupabaseError(error) }, { status: 500 });
  }

  return NextResponse.json({ client }, { status: 201 });
}
