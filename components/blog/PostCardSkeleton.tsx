type PostCardSkeletonProps = {
  count?: number;
  className?: string;
};

const skeletonClass = "bg-gray-200 animate-pulse";

export default function PostCardSkeleton({
  count = 1,
  className = "",
}: PostCardSkeletonProps) {
  const skeletonCount = Number.isFinite(count)
    ? Math.max(1, Math.floor(count))
    : 1;

  return (
    <div
      className={`mb-3 w-full space-y-1 sm:space-y-3 ${className}`}
      role="status"
      aria-label="Đang tải bài viết"
    >
      {Array.from({ length: skeletonCount }, (_, index) => (
        <article key={index} className="post relative" aria-hidden="true">
          <div className="overflow-hidden rounded-none bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:rounded-2xl">
            {/* PostHeader */}
            <div className="flex select-none items-center justify-between px-3 pt-3 sm:px-4 sm:pt-4">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={`size-10 shrink-0 rounded-full border border-neutral-200 ${skeletonClass}`}
                />

                <div className="flex min-w-0 flex-col gap-1.5">
                  <div className={`h-4 w-24 rounded-xl ${skeletonClass}`} />
                  <div className={`h-3 w-18 rounded-xl ${skeletonClass}`} />
                </div>
              </div>

              <div className={`size-8 rounded-full ${skeletonClass}`} />
            </div>

            {/* PostSnippet: luôn cố định 3 hàng */}
            <div className="space-y-2 px-3 pt-4 sm:px-4">
              <div className={`h-4 w-[97%] rounded-xl ${skeletonClass}`} />
              <div className={`h-4 w-[70%] rounded-xl ${skeletonClass}`} />
              <div className={`h-4 w-[55%] rounded-xl ${skeletonClass}`} />
            </div>

            {/* PostImages: một khung cố định, không phụ thuộc dữ liệu bài viết */}
            <div className="mt-3 h-48 w-full animate-pulse rounded-lg bg-transparent sm:h-56 sm:rounded-none" />

            {/* PostActions */}
            <div className="flex items-center gap-3 px-4 py-3">
              <div className={`size-[22px] rounded-full ${skeletonClass}`} />
            </div>
          </div>
        </article>
      ))}

      <span className="sr-only">Đang tải bài viết...</span>
    </div>
  );
}
