const SKELETON_CARD_CLASS = [
  "min-w-0 h-auto",
  "[&>div]:aspect-[2/3]",
  "[&>div]:rounded-[.85rem]",
  "[&>div]:bg-skeleton",
  "[&>span]:mx-auto [&>span]:mt-[.85rem] [&>span]:block",
  "[&>span]:h-[.65rem] [&>span]:w-[85%] [&>span]:rounded-full",
  "[&>span]:bg-skeleton",
  "[&>span:last-child]:mt-2 [&>span:last-child]:w-[55%]",
  "[&>span:last-child]:opacity-60",
].join(" ");

const SKELETON_WRAPPER_CLASS = [
  "grid grid-flow-col overflow-hidden",
  // 1. Đồng bộ padding/margin khớp 100% với class của thẻ <Swiper>
  "-mx-1! -mt-[.35rem]! -mb-2! px-1! pt-[.35rem]! pb-2!",
  
  // 2. Tính toán chính xác chiều rộng dựa trên số slide và khoảng cách (gap)
  // Default (< 360px): 2 slides, gap 12px (gap-3)
  "gap-3 auto-cols-[calc((100%_-_12px)/2)]",
  
  // 360px -> 639px: 3 slides, gap 4px (gap-1)
  "min-[360px]:gap-1 min-[360px]:auto-cols-[calc((100%_-_8px)/3)]",
  
  // 640px -> 959px: 4 slides, gap 4px
  "min-[640px]:auto-cols-[calc((100%_-_12px)/4)]",
  
  // 960px -> 1199px: 5 slides, gap 4px
  "min-[960px]:auto-cols-[calc((100%_-_16px)/5)]",
  
  // 1200px -> 1535px: 6 slides, gap 8px (gap-2)
  "min-[1200px]:gap-2 min-[1200px]:auto-cols-[calc((100%_-_40px)/6)]",
  
  // >= 1536px: 7 slides, gap 8px
  "min-[1536px]:auto-cols-[calc((100%_-_48px)/7)]"
].join(" ");

export default function WatchRowSkeleton({ loading }: { loading: boolean }) {
  return (
    <div
      className={SKELETON_WRAPPER_CLASS}
      role={loading ? "status" : undefined}
      aria-hidden={!loading}
    >
      {loading && <span className="sr-only">Đang tải danh sách phim…</span>}

      {/* Hiển thị 8 skeletons để bao phủ đủ màn hình siêu rộng (max 7 slides) + 1 cái dư bị ẩn bớt */}
      {Array.from({ length: 8 }, (_, index) => (
        <div key={index} className={SKELETON_CARD_CLASS} aria-hidden="true">
          <div />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}