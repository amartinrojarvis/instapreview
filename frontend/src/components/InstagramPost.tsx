"use client";

import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal, Smile } from "lucide-react";
import { CarouselViewer } from "@/components/CarouselViewer";
import { VideoPlayer } from "@/components/VideoPlayer";
import { API_URL, type PublicClient, type PublicPost } from "@/lib/api";

function hoursAgoLabel(createdAt?: string): string {
  if (!createdAt) return "HACE 1 HORA";
  const d = new Date(createdAt);
  const diffH = Math.max(1, Math.round((Date.now() - d.getTime()) / (1000 * 60 * 60)));
  
  if (diffH < 24) {
    return `HACE ${diffH} HORA${diffH === 1 ? "" : "S"}`;
  }
  
  const diffD = Math.round(diffH / 24);
  return `HACE ${diffD} DÍA${diffD === 1 ? "" : "S"}`;
}

function formatLikes(count: number): string {
  if (count === 0) return "0";
  if (count < 1000) return count.toString();
  if (count < 1000000) {
    const k = Math.floor(count / 1000);
    return `${k} mil`;
  }
  return `${(count / 1000000).toFixed(1)} M`;
}

interface InstagramPostProps {
  client: PublicClient;
  post: PublicPost;
}

export function InstagramPost({ client, post }: InstagramPostProps) {
  // Ensure files have API_URL prefix
  const processedFiles = post.files.map(file => 
    file.startsWith("http") ? file : `${API_URL}${file}`
  );

  return (
    <article className="bg-white mb-4">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Avatar with story ring */}
          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] p-[2px]">
            <div className="h-full w-full rounded-full bg-white p-[2px]">
              <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-sm font-medium text-gray-400">
                  {client.name.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <span className="text-sm font-semibold text-[#262626] hover:opacity-60 cursor-pointer">
              {client.slug}
            </span>
            <span className="text-[#8e8e8e]">•</span>
            <span className="text-sm text-[#8e8e8e]">Preview</span>
          </div>
        </div>
        
        <button className="p-1 text-[#262626] hover:opacity-60 transition-opacity">
          <MoreHorizontal className="h-6 w-6" />
        </button>
      </header>

      {/* Media */}
      <div className="border-y border-[#efefef]">
        {post.type === "video" ? (
          <VideoPlayer src={processedFiles[0]} />
        ) : processedFiles.length > 1 ? (
          <CarouselViewer files={processedFiles} alt={post.caption || "post"} />
        ) : (
          <div className="bg-black">
            <img 
              src={processedFiles[0]} 
              alt={post.caption || "post"} 
              className="w-full h-auto max-h-[600px] object-contain mx-auto" 
            />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-4 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button className="p-0.5 hover:opacity-60 transition-opacity">
              <Heart className="h-7 w-7 text-[#262626]" strokeWidth={1.5} />
            </button>
            <button className="p-0.5 hover:opacity-60 transition-opacity">
              <MessageCircle className="h-7 w-7 text-[#262626] rotate-[270deg]" strokeWidth={1.5} />
            </button>
            <button className="p-0.5 hover:opacity-60 transition-opacity">
              <Send className="h-7 w-7 text-[#262626] rotate-[10deg]" strokeWidth={1.5} />
            </button>
          </div>
          
          <button className="p-0.5 hover:opacity-60 transition-opacity">
            <Bookmark className="h-7 w-7 text-[#262626]" strokeWidth={1.5} />
          </button>
        </div>

        {/* Likes count */}
        <div className="mt-3">
          <span className="text-sm font-semibold text-[#262626]">
            {formatLikes(post.likes_count || 0)} Me gusta
          </span>
        </div>

        {/* Caption */}
        {(post.caption || post.hashtags) && (
          <div className="mt-2 text-sm text-[#262626]">
            <span className="font-semibold">{client.slug}</span>{" "}
            <span className="whitespace-pre-wrap">{post.caption}</span>{" "}
            {post.hashtags && (
              <span className="text-[#00376b] hover:underline cursor-pointer">{post.hashtags}</span>
            )}
          </div>
        )}

        {/* Comments link */}
        <button className="mt-2 text-sm text-[#8e8e8e] hover:text-[#262626] transition-colors">
          Ver los 5 comentarios
        </button>

        {/* Timestamp */}
        <div className="mt-1 text-[10px] text-[#8e8e8e] uppercase tracking-wide">
          {hoursAgoLabel(post.created_at)}
        </div>
      </div>

      {/* Comment input */}
      <div className="mt-3 border-t border-[#efefef] px-4 py-3">
        <div className="flex items-center gap-3">
          <button className="p-0.5 hover:opacity-60 transition-opacity">
            <Smile className="h-6 w-6 text-[#8e8e8e]" strokeWidth={1.5} />
          </button>
          <input
            type="text"
            placeholder="Añade un comentario..."
            className="flex-1 bg-transparent text-sm text-[#262626] placeholder-[#8e8e8e] outline-none"
          />
          <button className="text-sm font-semibold text-[#0095f6] opacity-50 hover:opacity-100 transition-opacity">
            Publicar
          </button>
        </div>
      </div>
    </article>
  );
}
