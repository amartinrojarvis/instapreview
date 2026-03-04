import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import archiver from "archiver";
import { PassThrough, Readable } from "node:stream";
import { withCors, corsOptionsResponse } from "@/lib/cors";

export const runtime = "nodejs";

export async function OPTIONS() {
  return corsOptionsResponse();
}

export async function GET(_: Request, { params }: { params: { clientSlug: string } }) {
  // Get client
  const { data: client, error: clientError } = await supabase
    .from('clients')
    .select('*')
    .eq('slug', params.clientSlug)
    .single()

  if (clientError || !client) {
    return withCors(NextResponse.json({ error: "Not found" }, { status: 404 }));
  }

  // Get posts
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .eq('client_id', client.id)
    .order('position', { ascending: true })

  if (postsError) {
    return withCors(NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 }));
  }

  const archive = archiver("zip", { zlib: { level: 9 } });
  const passthrough = new PassThrough();
  archive.pipe(passthrough);

  // Add each post's files to the archive
  for (const post of (posts || [])) {
    const folderName = `post_${post.position}_${post.id}`;

    // List files in storage for this post
    const { data: files } = await supabase
      .storage
      .from('posts')
      .list(post.storage_path)

    if (files && files.length > 0) {
      for (const file of files) {
        // Download file from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase
          .storage
          .from('posts')
          .download(`${post.storage_path}/${file.name}`)

        if (!downloadError && fileData) {
          const buffer = Buffer.from(await fileData.arrayBuffer())
          archive.append(buffer, { name: `${folderName}/${file.name}` });
        }
      }
    }

    // Add caption file
    const captionText = `${client.slug}\n\n${post.caption || ""}\n\n${post.hashtags || ""}\n`;
    archive.append(captionText, { name: `${folderName}/caption.txt` });
  }

  archive.finalize();

  const webStream = Readable.toWeb(passthrough) as unknown as ReadableStream;

  return new NextResponse(webStream, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=instapreview_${client.slug}.zip`,
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
