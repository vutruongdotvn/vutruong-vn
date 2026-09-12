const SKELETON_CARD_CLASS = [
  "min-w-0 h-auto",
  "[&>div]:aspect-[2/3]",
  "[&>div]:rounded-[.85rem]",
  "max-[39.99rem]:[&>div]:rounded-[.65rem]",
  "[&>div]:bg-skeleton animate-pulse",
  "[&>span]:mx-auto [&>span]:mt-[.85rem] [&>span]:block",
  "[&>span]:h-[.65rem] [&>span]:w-[85%] [&>span]:rounded-full",
  "[&>span]:bg-skeleton",
  "[&>span:last-child]:mt-2 [&>span:last-child]:w-[55%]",
  "[&>span:last-child]:opacity-60",
].join(" ");

const SKELETON_WRAPPER_CLASS = [
  "grid grid-flow-col overflow-hidden",

  // Khớp padding/margin của <Swiper> để poster skeleton và card thật
  // bắt đầu/kết thúc trên cùng một trục, kể cả phần bóng/overflow.
  "-mx-1! -mt-[.35rem]! -mb-2! px-1! pt-[.35rem]! pb-2!",

  // < 360px: WatchSlider vẫn hiển thị tối thiểu 3 card, gap 12px.
  // 3 cột có 2 khoảng cách => trừ tổng 24px trước khi chia 3.
  "gap-3 auto-cols-[calc((100%_-_24px)/3)]",

  // 360px -> 639px: 3 card, gap 4px.
  "min-[360px]:gap-1 min-[360px]:auto-cols-[calc((100%_-_8px)/3)]",

  // 640px -> 959px: 4 card, gap 4px.
  "min-[640px]:auto-cols-[calc((100%_-_12px)/4)]",

  // 960px -> 1199px: 5 card, gap 4px.
  "min-[960px]:auto-cols-[calc((100%_-_16px)/5)]",

  // 1200px -> 1535px: 6 card, gap 8px.
  "min-[1200px]:gap-2 min-[1200px]:auto-cols-[calc((100%_-_40px)/6)]",

  // >= 1536px: 7 card, gap 8px.
  "min-[1536px]:auto-cols-[calc((100%_-_48px)/7)]",
].join(" ");

export default function WatchRowSkeleton({ loading }: { loading: boolean }) {
  return (
    <div
      className={SKELETON_WRAPPER_CLASS}
      role={loading ? "status" : undefined}
      aria-hidden={!loading}
    >
      {loading && <span className="sr-only">Đang tải danh sách phim…</span>}

      {/* 8 skeleton đủ bao phủ viewport siêu rộng (tối đa 7 card) + 1 card dư bị overflow ẩn. */}
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