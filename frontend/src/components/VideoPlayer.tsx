"use client";

import { API_URL } from "@/lib/api";

interface VideoPlayerProps {
  src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  // Ensure src has API_URL prefix if it's a relative path
  const videoSrc = src.startsWith("http") ? src : `${API_URL}${src}`;

  return (
    <div className="w-full bg-black">
      <video 
        src={videoSrc} 
        controls 
        className="w-full h-auto max-h-[600px]" 
        playsInline
        preload="metadata"
      />
    </div>
  );
}
