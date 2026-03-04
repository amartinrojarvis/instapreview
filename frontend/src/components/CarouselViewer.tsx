"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { API_URL } from "@/lib/api";

interface CarouselViewerProps {
  files: string[];
  alt: string;
}

export function CarouselViewer({ files, alt }: CarouselViewerProps) {
  const [idx, setIdx] = useState(0);
  const total = files.length;

  const canPrev = idx > 0;
  const canNext = idx < total - 1;

  const dots = useMemo(() => Array.from({ length: total }), [total]);

  // Ensure all files have API_URL prefix if they're relative paths
  const processedFiles = useMemo(() => {
    return files.map(file => file.startsWith("http") ? file : `${API_URL}${file}`);
  }, [files]);

  return (
    <div className="relative w-full bg-black">
      <img 
        src={processedFiles[idx]} 
        alt={alt} 
        className="w-full h-auto max-h-[600px] object-contain mx-auto" 
      />

      {total > 1 && (
        <>
          <button
            type="button"
            className={`absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-all hover:bg-white ${
              canPrev ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIdx((v) => Math.max(0, v - 1))}
            aria-label="Anterior"
          >
            <ChevronLeft className="h-5 w-5 text-gray-800" />
          </button>
          <button
            type="button"
            className={`absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition-all hover:bg-white ${
              canNext ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            onClick={() => setIdx((v) => Math.min(total - 1, v + 1))}
            aria-label="Siguiente"
          >
            <ChevronRight className="h-5 w-5 text-gray-800" />
          </button>

          {/* Dots indicator - InstaPreview style */}
          <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-1.5">
            {dots.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === idx 
                    ? "w-1.5 bg-white" 
                    : "w-1.5 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>

          {/* Counter badge */}
          <div className="absolute top-3 right-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
            {idx + 1}/{total}
          </div>
        </>
      )}
    </div>
  );
}
