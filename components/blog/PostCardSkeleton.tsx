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
      <div className="px-3 sm:px-4 space-y-2">
        <SkeletonLine width="w-[97%]" className="h-[16px]" />
        <SkeletonLine width="w-[69%]" className="h-[16px]" />
      </div>
    );
  }

  if (density === "long") {
    return (
      <div className="px-3 sm:px-4 space-y-2">
        <SkeletonLine width="w-[97%]" className="h-[16px]" />
        <SkeletonLine width="w-[70%]" className="h-[16px]" />
        <SkeletonLine width="w-[55%]" className="h-[16px]" />
      </div>
    );
  }

  return (
    <div className="px-3 sm:px-4 space-y-2">
        <SkeletonLine width="w-[97%]" className="h-[16px]" />
        <SkeletonLine width="w-[70%]" className="h-[16px]" />
        <SkeletonLine width="w-[55%]" className="h-[16px]" />
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

      {/* CONTENT */}
      <div
        className={`
              rounded-0 sm:rounded-2xl bg-white/80 backdrop-blur-md
              shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 overflow-hidden
              ${isPinned ? "pinnedPost" : ""}
            `}
      >
        {/* HEADER */}
        <div className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 select-none">
          <div className="flex items-center gap-2 min-w-0">
            <div className="leading-6 flex items-center gap-2 min-w-0 flex-wrap">
              <div className="size-10 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse border border-neutral-200" />
              <div className="flex items-start flex-col gap-1.5">
              <div className="h-4 w-24 rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
              <div className="h-3 w-18 rounded-xl bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
              </div>
            </div>
          </div>

          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
        </div>

        {/* BODY */}
        <div className="px-0 pt-4">
          <SkeletonText density={textDensity} />
          <SkeletonMedia variant={variant} moreCount={moreCount} />

          {/* ACTIONS */}
          <div className="flex items-center gap-3 py-3 px-3 sm:px-4">
            <SkeletonAction />
            <SkeletonAction />
            <SkeletonAction />
          </div>
        </div>
      </div>
    </article>
  );
}