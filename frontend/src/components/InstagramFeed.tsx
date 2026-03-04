import type { PublicClient, PublicPost } from "@/lib/api";
import { InstagramPost } from "@/components/InstagramPost";
import { ProfileHeader } from "@/components/ProfileHeader";
import { InstagramHeader } from "@/components/InstagramHeader";

interface InstagramFeedProps {
  client: PublicClient;
  posts: PublicPost[];
}

export function InstagramFeed({ client, posts }: InstagramFeedProps) {
  return (
    <div className="min-h-screen bg-white">
      {/* Instagram-style top navigation */}
      <InstagramHeader clientName={client.name} />

      {/* Profile header section */}
      <ProfileHeader client={client} postsCount={posts.length} />

      {/* Main feed */}
      <div className="mx-auto max-w-[470px]">
        {posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-16 w-16 rounded-full bg-[#fafafa] flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-[#8e8e8e]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-[#262626] mb-2">Aún no hay publicaciones</p>
            <p className="text-sm text-[#8e8e8e]">Cuando {client.name} publique contenido, aparecerá aquí.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#dbdbdb]">
            {posts.map((post) => (
              <InstagramPost key={post.id} client={client} post={post} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
