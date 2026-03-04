import { fetchPublicFeed, downloadZipUrl } from "@/lib/api";
import { InstaPreviewFeed } from "@/components/InstaPreviewFeed";

export default async function PreviewPage({ params }: { params: { clientId: string } }) {
  const { client, posts } = await fetchPublicFeed(params.clientId);

  return (
    <main className="min-h-screen bg-white px-4 sm:px-6">
      <div className="mx-auto max-w-lg py-4">
        <InstaPreviewFeed client={client} posts={posts} />
      </div>

      {/* Download button - floating */}
      <a
        href={downloadZipUrl(client.slug)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#0095f6] px-5 py-3 text-sm font-semibold text-white shadow-lg hover:bg-[#1877f2] transition-all"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Descargar todo
      </a>
    </main>
  );
}
