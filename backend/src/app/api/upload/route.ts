import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

function extFromMime(mime: string | null) {
  if (!mime) return "";
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "video/mp4") return ".mp4";
  if (mime === "video/quicktime") return ".mov";
  return "";
}

export async function POST(req: NextRequest) {
  try {
    console.log('Upload API called');
    const auth = requireAuth(req);
    if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: 401 });

    const form = await req.formData();
    const clientSlug = String(form.get("clientSlug") || "").trim();
    const postId = String(form.get("postId") || "").trim();
    const type = String(form.get("type") || "").trim();
    const fileIndex = Number(form.get("fileIndex") || 0);

    console.log('Upload request:', { clientSlug, postId, type, fileIndex });

    if (!clientSlug || !postId) {
      return NextResponse.json({ error: "Missing clientSlug/postId" }, { status: 400 });
    }

    // Get post from database to verify it exists and get storage_path
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('storage_path')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    // Use storage_path from post or generate default
    const storagePath = post.storage_path || `${clientSlug}/${postId}`;

    // Get single file (uno por petición)
    const file = form.get("files") as unknown as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    console.log('Processing file:', file.name, file.type, file.size, 'bytes');

    // Validar tamaño (límite de Supabase: 50MB por archivo en plan gratuito)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Max: 50MB` 
      }, { status: 400 });
    }

    const mime = file.type;
    const isImage = mime.startsWith("image/");
    const isVideo = mime.startsWith("video/");

    if (!isImage && !isVideo) {
      return NextResponse.json({ error: "Only images and videos allowed" }, { status: 400 });
    }

    // Generar nombre de archivo
    let filename = "";
    if (type === "video") {
      filename = `video${extFromMime(mime) || ".mp4"}`;
    } else {
      const ext = extFromMime(mime) || ".jpg";
      // Para carrusel, usar numeración: 1.jpg, 2.jpg, etc.
      filename = `${fileIndex + 1}${ext}`;
    }

    const filePath = `${storagePath}/${filename}`;
    
    // Convertir archivo a buffer (archivo original, sin compresión)
    const buffer = Buffer.from(await file.arrayBuffer());

    console.log('Uploading original file to:', filePath);
    
    // Upload to Supabase Storage (archivo original)
    const { error: uploadError } = await supabase
      .storage
      .from('posts')
      .upload(filePath, buffer, {
        contentType: mime,
        upsert: true
      })

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: `Upload failed: ${uploadError.message}` },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('posts')
      .getPublicUrl(filePath)

    console.log('File uploaded successfully:', publicUrl);

    return NextResponse.json({ 
      files: [{ filePath, fileUrl: publicUrl }],
      message: 'File uploaded successfully'
    });
    
  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown error' },
      { status: 500 }
    );
  }
}
