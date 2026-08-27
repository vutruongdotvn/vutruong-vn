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
        <article key={index} className="post relative border-b border-slate-200 last:border-b-0" aria-hidden="true">
          <div className="overflow-hidden rounded-none bg-white sm:rounded-2xl">
            {/* PostHeader */}
            <div className="flex select-none items-center justify-between px-3 pt-3 sm:px-4 sm:pt-4">
              <div className="flex min-w-0 items-center gap-2">
                <div
                  className={`w-[30px] h-[30px] shrink-0 rounded-full border border-neutral-200 ${skeletonClass}`}
                />

                <div className="flex min-w-0 items-center gap-1.5">
                  <div className={`h-4 w-33 rounded-xl ${skeletonClass}`} />
                </div>
              </div>

            </div>

            {/* PostSnippet: luôn cố định 3 hàng */}
            <div className="space-y-2 px-3 pt-4 sm:px-4">
              <div className={`h-4 w-[97%] rounded-xl ${skeletonClass}`} />
              <div className={`h-4 w-[70%] rounded-xl ${skeletonClass}`} />
              <div className={`h-4 w-[55%] rounded-xl ${skeletonClass}`} />
            </div>

            {/* PostImages: một khung cố định, không phụ thuộc dữ liệu bài viết */}
            <div className="mt-3 h-40 w-full animate-pulse rounded-lg bg-transparent sm:h-56 sm:rounded-none" />

          </div>
        </article>
      ))}

      <span className="sr-only">Đang tải bài viết...</span>
    </div>
  );
}
