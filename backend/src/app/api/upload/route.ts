import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Configuración para permitir uploads grandes (hasta 100MB para videos)
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '100mb',
    },
  },
};

function extFromMime(mime: string | null) {
  if (!mime) return "";
  if (mime === "image/jpeg") return ".jpg";
  if (mime === "image/png") return ".png";
  if (mime === "image/webp") return ".webp";
  if (mime === "video/mp4") return ".mp4";
  if (mime === "video/quicktime") return ".mov";
  return "";
}

// Headers CORS para todas las respuestas
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    console.log('Upload API called - Carousel fix v1');
    
    // Debug: log headers
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    const auth = requireAuth(req);
    if (!auth.ok) {
      return NextResponse.json({ error: auth.error }, { status: 401, headers: corsHeaders });
    }

    console.log('Parsing formData...');
    const form = await req.formData();
    console.log('FormData parsed successfully');
    
    const clientSlug = String(form.get("clientSlug") || "").trim();
    const postId = String(form.get("postId") || "").trim();
    const type = String(form.get("type") || "").trim();

    console.log('Upload request:', { clientSlug, postId, type });

    if (!clientSlug || !postId) {
      return NextResponse.json({ error: "Missing clientSlug/postId" }, { status: 400, headers: corsHeaders });
    }

    // Get post from database to verify it exists and get storage_path
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('storage_path')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      console.error('Post not found:', postError);
      return NextResponse.json({ error: "Post not found" }, { status: 404, headers: corsHeaders });
    }

    // Use storage_path from post or generate default
    const storagePath = post.storage_path || `${clientSlug}/${postId}`;

    console.log('Getting files from formData...');
    const files = form.getAll("files").filter(Boolean) as unknown as File[];
    console.log('Files from form.getAll:', files.length);
    
    if (!files.length) {
      const single = form.get("file") as unknown as File | null;
      if (single) files.push(single);
    }

    if (!files.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400, headers: corsHeaders });
    }

    console.log('Files to upload:', files.length, 'Type:', type);

    // Simple limits
    if (type === "carousel" && files.length > 10) {
      return NextResponse.json({ error: "Carousel max 10 images" }, { status: 400, headers: corsHeaders });
    }

    const saved: { filePath: string; fileUrl: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`Processing file ${i}:`, file.name, file.type, file.size);
      
      const mime = file.type;
      const size = file.size;

      const isImage = mime.startsWith("image/");
      const isVideo = mime.startsWith("video/");

      if (isImage && size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Image too large (10MB max)" }, { status: 400, headers: corsHeaders });
      }
      if (isVideo && size > 100 * 1024 * 1024) {
        return NextResponse.json({ error: "Video too large (100MB max)" }, { status: 400, headers: corsHeaders });
      }

      let filename = "";
      if (type === "video") {
        filename = `video${extFromMime(mime) || ".mp4"}`;
      } else {
        const ext = extFromMime(mime) || ".jpg";
        filename = `${i + 1}${ext}`;
      }

      const filePath = `${storagePath}/${filename}`;
      
      console.log(`Reading file ${i} to buffer...`);
      const buffer = Buffer.from(await file.arrayBuffer());
      console.log(`Buffer created for file ${i}:`, buffer.length, 'bytes');

      // Upload to Supabase Storage
      console.log('Uploading to path:', filePath, 'MIME:', mime);
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
          { error: `Upload failed: ${uploadError.message}`, details: uploadError },
          { status: 500, headers: corsHeaders }
        );
      }

      // Get public URL
      const { data: { publicUrl } } = supabase
        .storage
        .from('posts')
        .getPublicUrl(filePath)

      saved.push({
        filePath,
        fileUrl: publicUrl,
      });
      
      console.log(`File ${i} uploaded successfully:`, publicUrl);
    }

    console.log('All files uploaded:', saved.length);
    return NextResponse.json({ files: saved }, { headers: corsHeaders });
  } catch (err: any) {
    console.error('Upload route error:', err);
    return NextResponse.json(
      { error: err.message || 'Unknown error', stack: err.stack },
      { status: 500, headers: corsHeaders }
    );
  }
}
