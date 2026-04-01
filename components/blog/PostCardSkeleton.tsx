type Variant = "text" | "single" | "double" | "grid";

type Props = {
  variant?: Variant;
  isLast?: boolean;
};

function SkeletonLine({
  width,
  height = "h-4",
  className = "",
}: {
  width: string;
  height?: string;
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse ${height} ${width} ${className}`}
    />
  );
}

function SkeletonAction() {
  return (
    <div className="flex items-center gap-[6px]">
      <div className="w-[18px] h-[18px] rounded-full bg-gray-200 animate-pulse" />
    </div>
  );
}

export default function PostCardSkeleton({
  variant = "single",
  isLast = false,
}: Props) {
  return (
    <article className="timelineItem relative">
      <div className="grid md:grid-cols-[40px_1fr] grid-cols-[33px_1fr] gap-2 md:gap-3">
        {/* LEFT TIMELINE */}
        <div className="relative flex flex-col items-center">
          {/* Avatar */}
          <div className="relative z-20 mt-2 w-[33px] h-[33px] md:w-[40px] md:h-[40px] rounded-full bg-gradient-to-br from-gray-300 to-gray-200 animate-pulse" />

          {/* Line */}
          <div
            className={`absolute mt-3 top-15 w-[2px] bg-gradient-to-b from-gray-300 via-gray-200 to-transparent z-0 ${
              isLast ? "bottom-8" : "bottom-[-10px]"
            }`}
          />

          {/* Dot */}
          <div className="relative z-10 mt-3 size-3 rounded-full border-2 border-white shadow-sm bg-gray-300 animate-pulse" />
        </div>

        {/* RIGHT CONTENT */}
        <div className="p-0">
          <div
            className="
              rounded-2xl bg-white/80 backdrop-blur-md
              shadow-[0_8px_30px_rgba(0,0,0,0.04)] overflow-hidden
            "
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-3 sm:px-5 pt-3 sm:pt-5 select-none">
              <div className="flex items-center gap-2 min-w-0">
                <div className="leading-6 flex items-center gap-2 min-w-0 flex-wrap">
                  <div className="h-[34px] w-[100px] rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse border border-neutral-200" />
                  <div className="h-4 w-24 rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            </div>

            {/* BODY */}
            <div className="px-0 sm:px-5 pt-4">
              {/* Title / text */}
              <div className="px-3 sm:px-0 space-y-3">
                <SkeletonLine width="w-[96%]" />
                <SkeletonLine width="w-[88%]" />
                <SkeletonLine width="w-[72%]" />
              </div>

              {/* MEDIA */}
              {variant === "single" && (
                <div className="mt-4">
                  <div className="w-full aspect-video rounded-0 sm:rounded-lg bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                </div>
              )}

              {variant === "double" && (
                <div className="grid grid-cols-2 gap-[2px] md:gap-[6px] mt-4">
                  <div className="aspect-[4/3] rounded-0 sm:rounded-lg bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                  <div className="aspect-[4/3] rounded-0 sm:rounded-lg bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                </div>
              )}

              {variant === "grid" && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-[2px] md:gap-[6px] mt-4">
                  <div className="aspect-[4/3] sm:aspect-[3/4] rounded-0 sm:rounded-lg bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                  <div className="aspect-[4/3] sm:aspect-[3/4] rounded-0 sm:rounded-lg bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                  <div className="aspect-[4/3] sm:aspect-[3/4] rounded-0 sm:rounded-lg bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                  <div className="aspect-[4/3] sm:aspect-[3/4] rounded-0 sm:rounded-lg bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex items-center gap-5 pt-5 pb-4 px-5 sm:px-0">
                <SkeletonAction />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}