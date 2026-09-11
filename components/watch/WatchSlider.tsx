"use client";

import Link from "next/link";
import { useId, useMemo, useRef, useState } from "react";
import { A11y } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import WatchMovieCard from "@/components/watch/WatchMovieCard";
import WatchRowSkeleton from "@/components/watch/WatchRowSkeleton";
import { useWatchCollection } from "@/hooks/watch/useWatchCollection";
import { useWatchRowVisibility } from "@/hooks/watch/useWatchRowVisibility";
import { watchCollectionMovies } from "@/lib/watch/watchCollectionView";
import { watchCollectionHref } from "@/lib/watch/watchRoutes";
import {
  WatchApiError,
  watchApiErrorMessage,
  type WatchCollectionSource,
} from "@/types/watchApi";
import "swiper/css";

type Props = {
  id: string;
  title: string;
  description?: string;
  source: WatchCollectionSource;
};

type Edges = {
  beginning: boolean;
  end: boolean;
  locked: boolean;
};

const SLIDER_SECTION_CLASS = [
  "min-w-0 scroll-mt-26",
  "[--card-width:calc((100%_-_15px)/2)]",
  "min-[30rem]:[--card-width:calc((100%_-_31.5px)/3)]",
  "min-[40rem]:[--card-width:calc((100%_-_52px)/4)]",
  "min-[60rem]:[--card-width:calc((100%_-_68px)/5)]",
  "min-[75rem]:[--card-width:calc((100%_-_84px)/6)]",
  "min-[96rem]:[--card-width:calc((100%_-_100px)/7)]",
  "[&_button:disabled]:cursor-default [&_button:disabled]:opacity-35",
  "[&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-ring",
  "[&_button:focus-visible]:outline-offset-[3px]",
  "max-[39.99rem]:scroll-mt-22",
  "motion-reduce:[&_.swiper-wrapper]:duration-0!",
].join(" ");

const HEADING_LINK_CLASS = [
  "group/watch-heading inline-flex items-center gap-2 text-foreground no-underline",
  "rounded-sm focus-visible:outline-2 focus-visible:outline-ring",
  "focus-visible:outline-offset-4",
  "[&_i]:text-[.7em] [&_i]:text-muted-foreground",
  "[&_i]:transition-transform [&_i]:duration-200",
  "hover:[&_i]:translate-x-1 motion-reduce:[&_i]:transition-none",
].join(" ");

const EMPTY_STATE_CLASS = [
  "flex min-h-60 flex-col items-center justify-center",
  "rounded-[1rem] border border-dashed border-border bg-surface",
  "px-6 py-8 text-center",
  "[&>i]:mb-4 [&>i]:text-[1.7rem] [&>i]:text-muted-foreground",
  "[&_h3]:m-0 [&_h3]:text-base [&_h3]:font-semibold",
  "[&_p]:m-0 [&_p]:mt-[.65rem] [&_p]:max-w-[29rem]",
  "[&_p]:text-[.85rem] [&_p]:leading-[1.7] [&_p]:text-muted-foreground",
].join(" ");

const SWIPER_BREAKPOINTS = {
  360: { slidesPerView: 3, spaceBetween: 4 },
  480: { slidesPerView: 3, spaceBetween: 4 },
  640: { slidesPerView: 4, spaceBetween: 4 },
  960: { slidesPerView: 5, spaceBetween: 4 },
  1200: { slidesPerView: 6, spaceBetween: 8 },
  1536: { slidesPerView: 7, spaceBetween: 8 },
} as const;

function WatchRowError({
  error,
  pending,
  retry,
}: {
  error: string;
  pending: boolean;
  retry: () => void;
}) {
  return (
    <div className={EMPTY_STATE_CLASS} role="status">
      <i className="fad fa-cloud-exclamation" aria-hidden="true" />
      <h3>Chưa tải được danh sách</h3>
      <p>{error}</p>
      <button
        type="button"
        className="mt-[1.1rem] cursor-pointer rounded-full border border-border bg-card px-4 py-[.65rem] text-[.8rem] text-foreground"
        disabled={pending}
        onClick={retry}
      >
        {pending ? "Đang tải…" : "Thử lại mục này"}
      </button>
    </div>
  );
}

function WatchRowEmpty() {
  return (
    <div className={EMPTY_STATE_CLASS} role="status">
      <i className="fad fa-film" aria-hidden="true" />
      <h3>Chưa có phim trong mục này</h3>
      <p>Bạn có thể khám phá các bộ sưu tập bên dưới.</p>
    </div>
  );
}

export default function WatchSlider({ id, title, description, source }: Props) {
  const row = useWatchRowVisibility();
  const query = useWatchCollection(source, row.visible);
  const movies = useMemo(
    () => watchCollectionMovies(query.data?.items ?? []),
    [query.data],
  );

  const [edges, setEdges] = useState<Edges>({
    beginning: true,
    end: true,
    locked: true,
  });

  const swiper = useRef<SwiperInstance | null>(null);
  const headingId = useId();
  const collectionHref = watchCollectionHref(source);

  function sync(instance: SwiperInstance) {
    const next = {
      beginning: instance.isBeginning,
      end: instance.isEnd,
      locked: instance.isLocked,
    };

    setEdges(old => (
      old.beginning === next.beginning
        && old.end === next.end
        && old.locked === next.locked
        ? old
        : next
    ));
  }

  function move(direction: "prev" | "next") {
    const instance = swiper.current;

    if (!instance || instance.destroyed) {
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const speed = reducedMotion ? 0 : 350;

    if (direction === "prev") {
      instance.slidePrev(speed);
    } else {
      instance.slideNext(speed);
    }
  }

  function retry() {
    if (!query.isFetching) {
      void query.refetch({ cancelRefetch: false });
    }
  }

  const error = query.error instanceof WatchApiError
    && query.error.code === "rate_limited"
    ? watchApiErrorMessage(query.error)
    : "Nguồn phim tạm thời chưa phản hồi.";

  return (
    <section
      id={id}
      ref={row.ref}
      className={SLIDER_SECTION_CLASS}
      aria-labelledby={headingId}
      data-watch-row={id}
      onFocusCapture={row.activate}
    >
      <header className="mb-[1.35rem] flex items-center justify-between gap-6 max-[39.99rem]:mb-4 max-[39.99rem]:items-start max-[39.99rem]:gap-[.6rem]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-[.65rem] [&_h2]:m-0 [&_h2]:text-[clamp(1.3rem,1.8vw,1.35rem)] [&_h2]:font-[750] [&_h2]:leading-[1.3] [&_h2]:tracking-[.025em] [&_h2]:text-foreground [&_h2:focus]:outline-none max-[39.99rem]:gap-2 max-[39.99rem]:[&_h2]:text-[1.2rem]">
            <h2 id={headingId} tabIndex={-1}>
              {collectionHref ? (
                <Link
                  href={collectionHref}
                  prefetch={false}
                  className={HEADING_LINK_CLASS}
                  aria-label={`Xem tất cả: ${title}`}
                >
                  {title}
                  <i className="fad fa-arrow-right" aria-hidden="true" />
                </Link>
              ) : title}
            </h2>

            {/* {movies.length > 0 && (
              <span className="rounded-full border border-border px-2 py-[.2rem] text-[.65rem] whitespace-nowrap text-muted-foreground tabular-nums max-[39.99rem]:text-[.6rem]">
                {movies.length} phim
              </span>
            )} */}
          </div>

          {description && (
            <p className="m-0 mt-[.4rem] text-[.8rem] leading-[1.6] text-muted-foreground max-[39.99rem]:text-xs">
              {description}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-[.45rem] max-[39.99rem]:hidden">
          <button
            type="button"
            className="grid size-[2.35rem] cursor-pointer place-items-center rounded-full border border-border bg-card text-xs text-foreground enabled:hover:bg-accent"
            aria-label={`Phim trước — ${title}`}
            disabled={movies.length < 2 || edges.beginning || edges.locked}
            onClick={() => move("prev")}
          >
            <i className="fad fa-chevron-left" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="grid size-[2.35rem] cursor-pointer place-items-center rounded-full border border-border bg-card text-xs text-foreground enabled:hover:bg-accent"
            aria-label={`Phim tiếp theo — ${title}`}
            disabled={movies.length < 2 || edges.end || edges.locked}
            onClick={() => move("next")}
          >
            <i className="fad fa-chevron-right" aria-hidden="true" />
          </button>
        </div>
      </header>

      <div aria-busy={row.visible && query.isFetching}>
        {!row.visible || query.isPending ? (
          <WatchRowSkeleton loading={row.visible} />
        ) : query.isError && !query.data ? (
          <WatchRowError error={error} pending={query.isFetching} retry={retry} />
        ) : movies.length === 0 ? (
          <WatchRowEmpty />
        ) : (
          <Swiper
            // 1. TÙY CHỈNH GIAO DIỆN (CSS)
            // Sử dụng Tailwind CSS. Dấu `!` ở cuối (ví dụ: -mx-1!) tương đương với `!important` trong CSS.
            // Đoạn này chủ yếu dùng lề âm (-mx, -mt) và đệm bù lại (px, pt) để xử lý việc đổ bóng (box-shadow) 
            // của các card phim không bị cắt gọt bởi `overflow-hidden` mặc định của Swiper.
            className="-mx-1! -mt-[.35rem]! -mb-2! px-1! pt-[.35rem]! pb-2!"

            // 2. KHAI BÁO MODULE
            // Swiper được thiết kế dạng module để giảm dung lượng. Ở đây bạn đang nạp module A11y (Accessibility/Trợ năng).
            // Nếu bạn muốn dùng nút Next/Prev hay Pagination (chấm tròn), bạn phải import và khai báo thêm ở đây (VD: modules={[A11y, Navigation, Pagination]}).
            modules={[A11y]}

            // 3. CẤU HÌNH HIỂN THỊ CƠ BẢN
            // Số lượng slide hiển thị cùng lúc trên màn hình (mặc định là 2).
            slidesPerView={3}
            // Khoảng cách giữa các slide là 12px.
            spaceBetween={12}
            // Khi người dùng vuốt hoặc nhấn next, slider sẽ trượt đi 1 slide mỗi lần.
            slidesPerGroup={1}

            // 4. CẤU HÌNH HÀNH VI (BEHAVIOR)
            // Tắt chế độ lặp vô tận. Cuộn đến cuối sẽ dừng lại, không quay vòng về slide đầu.
            loop={false}
            // Nếu tổng số slide ít hơn `slidesPerView` (nghĩa là không đủ để trượt), Swiper sẽ tự động
            // ẩn đi các nút điều hướng và vô hiệu hóa chức năng trượt để tránh lỗi giao diện.
            watchOverflow
            // Tắt chế độ cuộn ngược. Nếu = true, khi đến slide cuối cùng mà bấm Next, nó sẽ trượt ngược tuột về đầu.
            rewind={false}

            // 5. RESPONSIVE (THÍCH ỨNG MÀN HÌNH)
            // Ghi đè các thuộc tính bên trên (như slidesPerView, spaceBetween) tùy theo kích thước màn hình.
            // Biến SWIPER_BREAKPOINTS được định nghĩa ở ngoài (VD: màn hình > 768px thì hiện 4 slide, > 1024px thì hiện 6 slide).
            breakpoints={SWIPER_BREAKPOINTS}

            // 6. TRỢ NĂNG (ACCESSIBILITY - A11y)
            // Hỗ trợ người dùng khiếm thị sử dụng trình đọc màn hình (Screen Reader).
            a11y={{
              enabled: true, // Bật tính năng
              containerRoleDescriptionMessage: title, // Mô tả vai trò của khối này (vd: "Danh sách phim hành động")
              itemRoleDescriptionMessage: "Phim", // Phân loại từng thẻ con là gì
              slideLabelMessage: "{{index}} trên {{slidesLength}}", // Đọc vị trí: "1 trên 10", "2 trên 10"
            }}

            // 7. XỬ LÝ SỰ KIỆN (EVENTS)
            // Kích hoạt ngay khi Swiper vừa khởi tạo xong.
            // instance chính là đối tượng lõi của Swiper, nó được lưu vào `swiper.current` (chắc hẳn bạn đang dùng useRef)
            // Hàm `sync(instance)` có thể là một hàm do bạn tự viết để đồng bộ trạng thái (ví dụ kiểm tra xem đang ở đầu hay cuối mảng để làm mờ nút Prev/Next tự chế).
            onSwiper={(instance: SwiperInstance) => {
              swiper.current = instance;
              sync(instance);
            }}

            // Kích hoạt mỗi khi slide bị thay đổi (người dùng vuốt, hoặc bấm chuyển slide).
            onSlideChange={sync}
            // Kích hoạt khi kích thước khung hình bị thay đổi (người dùng xoay màn hình điện thoại hoặc thu phóng trình duyệt).
            onResize={sync}
            // Kích hoạt khi Swiper chuyển sang trạng thái "khóa" (ví dụ: màn hình to ra làm số lượng slide hiển thị lớn hơn tổng số phim, nên không cần trượt nữa).
            onLock={sync}
            // Kích hoạt khi Swiper "mở khóa" (từ màn hình to thu nhỏ lại, bắt đầu cần trượt).
            onUnlock={sync}
          >
            {/* 8. RENDER DỮ LIỆU */}
            {/* Duyệt qua mảng phim và tạo ra các thẻ SwiperSlide */}
            {movies.map(movie => (
              // Thẻ bọc bắt buộc của Swiper. `h-auto!` giúp các slide có chiều cao bằng nhau (bằng với slide cao nhất)
              <SwiperSlide key={movie.slug} className="h-auto!">
                {/* Component hiển thị chi tiết 1 bộ phim của bạn */}
                <WatchMovieCard movie={movie} />
              </SwiperSlide>
            ))}
          </Swiper>
        )}
      </div>
    </section>
  );
}