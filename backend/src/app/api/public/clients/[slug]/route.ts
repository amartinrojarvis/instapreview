import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET(_: Request, { params }: { params: { slug: string } }) {
  const { data: client, error } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !client) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ client });
}
