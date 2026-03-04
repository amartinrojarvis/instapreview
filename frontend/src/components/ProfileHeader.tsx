"use client";

import type { PublicClient } from "@/lib/api";

interface ProfileHeaderProps {
  client: PublicClient;
  postsCount: number;
}

export function ProfileHeader({ client, postsCount }: ProfileHeaderProps) {
  // Mock data for followers/following (can be replaced with real data later)
  const followersCount = "1.2K";
  const followingCount = 348;

  return (
    <div className="border-b border-[#dbdbdb] bg-white px-4 py-6">
      <div className="mx-auto max-w-[935px]">
        <div className="flex items-start gap-8 md:gap-20">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="h-[77px] w-[77px] md:h-[150px] md:w-[150px] rounded-full bg-gradient-to-tr from-[#f58529] via-[#dd2a7b] to-[#8134af] p-[3px]">
              <div className="h-full w-full rounded-full bg-white p-[3px]">
                <div className="h-full w-full rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-3xl md:text-5xl font-light text-gray-400">
                    {client.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex flex-col gap-4">
              {/* Username and buttons */}
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-xl font-normal text-[#262626]">{client.slug}</h1>
                <div className="flex items-center gap-2">
                  <button className="rounded-lg bg-[#0095f6] px-4 py-1.5 text-sm font-semibold text-white hover:bg-[#1877f2] transition-colors">
                    Seguir
                  </button>
                  <button className="rounded-lg bg-[#efefef] px-4 py-1.5 text-sm font-semibold text-[#262626] hover:bg-[#dbdbdb] transition-colors">
                    Mensaje
                  </button>
                  <button className="rounded-lg bg-[#efefef] px-2 py-1.5 hover:bg-[#dbdbdb] transition-colors">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 9l-7 7-7-7"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden md:flex items-center gap-8 text-[#262626]">
                <div className="flex gap-1">
                  <span className="font-semibold">{postsCount}</span>
                  <span>{postsCount === 1 ? "publicación" : "publicaciones"}</span>
                </div>
                <div className="flex gap-1 cursor-pointer hover:opacity-60">
                  <span className="font-semibold">{followersCount}</span>
                  <span>seguidores</span>
                </div>
                <div className="flex gap-1 cursor-pointer hover:opacity-60">
                  <span className="font-semibold">{followingCount}</span>
                  <span>seguidos</span>
                </div>
              </div>

              {/* Bio */}
              <div className="text-sm text-[#262626]">
                <div className="font-semibold">{client.name}</div>
                <p className="mt-1 whitespace-pre-wrap">{client.description || "Sin descripción"}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Stats */}
        <div className="mt-6 flex items-center justify-around border-t border-[#dbdbdb] pt-4 md:hidden">
          <div className="flex flex-col items-center gap-1">
            <span className="font-semibold text-[#262626]">{postsCount}</span>
            <span className="text-xs text-[#8e8e8e]">{postsCount === 1 ? "publicación" : "publicaciones"}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-semibold text-[#262626]">{followersCount}</span>
            <span className="text-xs text-[#8e8e8e]">seguidores</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="font-semibold text-[#262626]">{followingCount}</span>
            <span className="text-xs text-[#8e8e8e]">seguidos</span>
          </div>
        </div>
      </div>
    </div>
  );
}
