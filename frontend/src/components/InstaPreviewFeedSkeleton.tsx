export function InstaPreviewFeedSkeleton() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header skeleton */}
      <header className="sticky top-0 z-50 border-b border-[#dbdbdb] bg-white">
        <div className="flex h-[60px] items-center justify-between px-4">
          <div className="h-8 w-24 bg-gray-200 rounded animate-pulse" />
          <div className="flex items-center gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-7 w-7 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </header>

      {/* Profile header skeleton */}
      <div className="border-b border-[#dbdbdb] px-4 py-6">
        <div className="mx-auto max-w-[935px]">
          <div className="flex items-start gap-8">
            <div className="h-[77px] w-[77px] md:h-[150px] md:w-[150px] rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                <div className="h-8 w-20 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="hidden md:flex items-center gap-8">
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-full max-w-[300px] bg-gray-200 rounded animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Posts skeleton */}
      <div className="mx-auto max-w-[470px] space-y-4">
        {[...Array(3)].map((_, i) => (
          <article key={i} className="border-b border-[#dbdbdb] pb-4">
            <div className="flex items-center gap-3 px-4 py-3">
              <div className="h-9 w-9 rounded-full bg-gray-200 animate-pulse" />
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <div className="px-4 pt-3 space-y-2">
              <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-full max-w-[200px] bg-gray-200 rounded animate-pulse" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
