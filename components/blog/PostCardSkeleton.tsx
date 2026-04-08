type Variant =
  | "text"
  | "single-landscape"
  | "single-portrait"
  | "double-portrait"
  | "double-landscape"
  | "double-mixed"
  | "triple-top-hero"
  | "triple-left-hero"
  | "grid"
  | "grid-more";

type TextDensity = "short" | "medium" | "long";

type Props = {
  variant?: Variant;
  isLast?: boolean;
  isPinned?: boolean;
  textDensity?: TextDensity;
  moreCount?: number;
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
    <div className="flex items-center gap-0.5">
      <div className="w-[22px] h-[22px] rounded-full bg-gray-200 animate-pulse" />
    </div>
  );
}

function MediaBlock({
  className = "",
  overlay,
}: {
  className?: string;
  overlay?: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 animate-pulse ${className}`}
    >
      {overlay}
    </div>
  );
}

function SkeletonText({
  density = "medium",
}: {
  density?: TextDensity;
}) {
  if (density === "short") {
    return (
      <div className="px-3 sm:px-5 space-y-3">
        <SkeletonLine width="w-[76%]" className="h-[18px]" />
        <SkeletonLine width="w-[42%]" className="h-[18px]" />
      </div>
    );
  }

  if (density === "long") {
    return (
      <div className="px-3 sm:px-5 space-y-3">
        <SkeletonLine width="w-[97%]" className="h-[18px]" />
        <SkeletonLine width="w-[92%]" className="h-[18px]" />
        <SkeletonLine width="w-[88%]" className="h-[18px]" />
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-5 space-y-3">
      <SkeletonLine width="w-[96%]" className="h-[18px]" />
      <SkeletonLine width="w-[88%]" className="h-[18px]" />
      <SkeletonLine width="w-[72%]" className="h-[18px]" />
    </div>
  );
}

function SkeletonMedia({
  variant,
  moreCount = 0,
}: {
  variant: Variant;
  moreCount?: number;
}) {
  if (variant === "text") return null;

  if (variant === "single-landscape") {
    return (
      <div className="postImages relative mt-3 overflow-hidden select-none max-h-[78vh] w-full px-3 sm:px-0">
        <MediaBlock className="w-full aspect-[4/3] rounded-lg sm:rounded-none" />
      </div>
    );
  }

  if (variant === "single-portrait") {
    return (
      <div className="postImages relative mt-3 overflow-hidden select-none max-h-[78vh] w-full aspect-[3/4] px-3 sm:px-0">
        <MediaBlock className="w-full h-full rounded-lg sm:rounded-none" />
      </div>
    );
  }

  if (variant === "double-portrait") {
    return (
      <div className="postImages grid grid-cols-2 gap-0.5 mt-3 select-none overflow-hidden px-3 sm:px-0">
        <MediaBlock className="aspect-[3/4] rounded-l-lg sm:rounded-none" />
        <MediaBlock className="aspect-[3/4] rounded-r-lg sm:rounded-none" />
      </div>
    );
  }

  if (variant === "double-landscape") {
    return (
      <div className="postImages grid grid-cols-2 gap-0.5 mt-3 select-none overflow-hidden px-3 sm:px-0">
        <MediaBlock className="aspect-[4/3] rounded-l-lg sm:rounded-none" />
        <MediaBlock className="aspect-[4/3] rounded-r-lg sm:rounded-none" />
      </div>
    );
  }

  if (variant === "double-mixed") {
    return (
      <div className="postImages grid grid-cols-2 gap-0.5 mt-3 select-none overflow-hidden px-3 sm:px-0">
        <MediaBlock className="aspect-square rounded-l-lg sm:rounded-none" />
        <MediaBlock className="aspect-square rounded-r-lg sm:rounded-none" />
      </div>
    );
  }

  if (variant === "triple-top-hero") {
    return (
      <div className="postImages mt-3 grid gap-0.5 select-none overflow-hidden px-3 sm:px-0">
        <div className="relative w-full aspect-video">
          <MediaBlock className="w-full h-full rounded-t-lg sm:rounded-none" />
        </div>

        <div className="grid grid-cols-2 gap-0.5">
          <MediaBlock className="aspect-[4/3] rounded-bl-lg sm:rounded-none" />
          <MediaBlock className="aspect-[4/3] rounded-br-lg sm:rounded-none" />
        </div>
      </div>
    );
  }

  if (variant === "triple-left-hero") {
    return (
      <div className="postImages grid grid-cols-2 gap-0.5 select-none aspect-[4/3] overflow-hidden mt-3 px-3 sm:px-0">
        <MediaBlock className="h-full rounded-l-lg sm:rounded-none" />

        <div className="grid grid-rows-2 gap-0.5 h-full">
          <MediaBlock className="h-full rounded-tr-lg sm:rounded-none" />
          <MediaBlock className="h-full rounded-br-lg sm:rounded-none" />
        </div>
      </div>
    );
  }

  if (variant === "grid") {
    return (
      <div className="postImages grid grid-cols-2 gap-0.5 mt-3 select-none overflow-hidden px-3 sm:px-0">
        <MediaBlock className="aspect-[4/3] rounded-tl-lg sm:rounded-none" />
        <MediaBlock className="aspect-[4/3] rounded-tr-lg sm:rounded-none" />
        <MediaBlock className="aspect-[4/3] rounded-bl-lg sm:rounded-none" />
        <MediaBlock className="aspect-[4/3] rounded-br-lg sm:rounded-none" />
      </div>
    );
  }

  return (
    <div className="postImages grid grid-cols-2 gap-0.5 mt-3 select-none overflow-hidden px-3 sm:px-0">
      <MediaBlock className="aspect-[4/3] rounded-tl-lg sm:rounded-none" />
      <MediaBlock className="aspect-[4/3] rounded-tr-lg sm:rounded-none" />
      <MediaBlock className="aspect-[4/3] rounded-bl-lg sm:rounded-none" />
      <MediaBlock
        className="aspect-[4/3] rounded-br-lg sm:rounded-none"
        overlay={
          <div className="absolute inset-0 bg-black/35 flex items-center justify-center">
            <div className="h-7 w-12 rounded-full bg-white/30 animate-pulse" />
            <span className="sr-only">+{moreCount}</span>
          </div>
        }
      />
    </div>
  );
}

export default function PostCardSkeleton({
  variant = "single-landscape",
  isLast = false,
  isPinned = false,
  textDensity = "medium",
  moreCount = 0,
}: Props) {
  return (
    <article className="timelineItem relative">
      <div className="grid md:grid-cols-[40px_1fr] grid-cols-[33px_1fr] gap-2 md:gap-3">
        {/* LEFT TIMELINE */}
        <div className="relative flex flex-col items-center">
          {/* Avatar */}
          <div className="relative z-20 mt-3.5 w-[33px] h-[33px] md:w-[40px] md:h-[40px] rounded-full bg-gradient-to-br from-gray-300 to-gray-200 animate-pulse" />

          {/* Line */}
          <div
            className={`absolute top-10 sm:top-18 w-[2px] bg-gradient-to-b from-gray-300 via-gray-200 to-transparent z-0 ${
              isLast ? "bottom-8" : "bottom-[-10px]"
            }`}
          />

          {/* Dot */}
          <div
            className={`relative z-10 mt-3 size-3 rounded-full border-2 border-white shadow-sm animate-pulse ${
              isPinned ? "bg-neutral-400" : "bg-gray-300"
            }`}
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="p-0">
          <div
            className={`
              rounded-2xl bg-white/80 backdrop-blur-md
              shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 overflow-hidden
              ${isPinned ? "pinnedPost" : ""}
            `}
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-3 sm:px-5 pt-3 sm:pt-5 select-none">
              <div className="flex items-center gap-2 min-w-0">
                <div className="leading-6 flex items-center gap-2 min-w-0 flex-wrap">
                  <div className="h-[28px] w-[100px] rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse border border-neutral-200" />
                  <div className="h-4 w-24 rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
                </div>
              </div>

              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
            </div>

            {/* BODY */}
            <div className="px-0 pt-3">
              <SkeletonText density={textDensity} />
              <SkeletonMedia variant={variant} moreCount={moreCount} />

              {/* ACTIONS */}
              <div className="flex items-center gap-5 pt-5 pb-4 px-5 sm:px-5">
                <SkeletonAction />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}