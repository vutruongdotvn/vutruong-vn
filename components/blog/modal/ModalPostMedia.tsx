"use client";

/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  type MouseEvent as ReactMouseEvent,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { Zoom, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/effect-fade";

import {
  getBlogPostFeedLightboxImage,
  getModalPostBackgroundImage,
  isCloudinaryImageUrl,
} from "@/lib/cloudinary";

type ModalPostMediaProps = {
  images: string[];
  postTitle: string;
};

// Trần zoom chung. Tăng lên 3 nếu muốn zoom tối đa 3x; ảnh nhỏ vẫn được
// limitToOriginalSize và data-swiper-zoom bảo vệ khỏi phóng quá độ phân giải.
const MAX_ZOOM_RATIO = 2;

// Chỉ bật cursor/click zoom khi ảnh còn ít nhất 5% độ phân giải dư so với
// kích thước đang hiển thị, tránh một thao tác zoom gần như không có tác dụng.
const MIN_USEFUL_ZOOM_RATIO = 1.05;

// Số ảnh tải trước ở mỗi phía của slide hiện tại. 1 là mức phù hợp với ảnh
// 2560px; tăng số này sẽ mượt hơn nhưng tải thêm nhiều dữ liệu và tốn bộ nhớ.
const LAZY_PRELOAD_ADJACENT_SLIDES = 1;

export default function ModalPostMedia({
  images,
  postTitle,
}: ModalPostMediaProps) {
  const router = useRouter();
  const swiperRef = useRef<SwiperInstance | null>(null);
  const imageElementsRef = useRef<Record<number, HTMLImageElement | null>>({});
  const isClosingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  // UI chỉ cần biết đang zoom hay chưa; không render lại từng frame pinch.
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomRatios, setZoomRatios] = useState<Record<number, number>>({});
  const [loadedImageIndexes, setLoadedImageIndexes] = useState<Set<number>>(
    () => new Set()
  );
  const [failedImageIndexes, setFailedImageIndexes] = useState<Set<number>>(
    () => new Set()
  );
  const hasMultipleImages = images.length > 1;
  const showNavigationButtons = images.length > 1;

  const closeModal = useCallback(() => {
    if (isClosingRef.current) return;

    isClosingRef.current = true;
    router.back();
  }, [router]);

  const handleImageError = (index: number) => {
    setFailedImageIndexes((currentIndexes) => {
      if (currentIndexes.has(index)) return currentIndexes;

      const nextIndexes = new Set(currentIndexes);
      nextIndexes.add(index);
      return nextIndexes;
    });
  };

  const updateZoomRatio = useCallback(
    (index: number, image: HTMLImageElement) => {
      if (!image.isConnected || !image.complete) return null;

      // clientWidth/Height là kích thước layout TRƯỚC transform của Swiper.
      // getBoundingClientRect() đo cả scale đang animate và có thể làm trần
      // zoom tụt về 1 ngay sau zoom-out, khiến những lần zoom sau bị khóa.
      const width = image.clientWidth;
      const height = image.clientHeight;
      if (
        width <= 0 ||
        height <= 0 ||
        image.naturalWidth <= 0 ||
        image.naturalHeight <= 0
      ) {
        return null;
      }

      const originalSizeRatio =
        Math.round(
          Math.min(
            image.naturalWidth / width,
            image.naturalHeight / height,
            MAX_ZOOM_RATIO
          ) * 1000
        ) / 1000;
      const nextRatio =
        originalSizeRatio > MIN_USEFUL_ZOOM_RATIO ? originalSizeRatio : 1;

      setZoomRatios((currentRatios) =>
        currentRatios[index] === nextRatio
          ? currentRatios
          : { ...currentRatios, [index]: nextRatio }
      );

      return nextRatio;
    },
    []
  );

  const handleImageLoad = (
    index: number,
    event: SyntheticEvent<HTMLImageElement>
  ) => {
    const image = event.currentTarget;

    const revealImage = () => {
      // Request decode có thể hoàn tất sau khi người dùng đã đóng modal.
      if (!image.isConnected) return;

      // Theo dõi độc lập từng ảnh. Ảnh đã tải chỉ fade-in đúng một lần, không
      // chạy lại animation mỗi khi chuyển slide hoặc thay đổi mức zoom.
      setLoadedImageIndexes((currentIndexes) => {
        if (currentIndexes.has(index)) return currentIndexes;

        const nextIndexes = new Set(currentIndexes);
        nextIndexes.add(index);
        return nextIndexes;
      });

      // Đợi trình duyệt hoàn tất bước contain để so kích thước nguồn với đúng
      // kích thước ảnh đang hiển thị, tránh cho zoom ảnh nhỏ vượt quá ảnh gốc.
      window.requestAnimationFrame(() => updateZoomRatio(index, image));
    };

    // onLoad xác nhận file đã tải; decode() xác nhận pixel đã sẵn sàng để vẽ.
    // Nếu browser từ chối decode, vẫn reveal vì sự kiện load đã thành công.
    void image
      .decode()
      .catch(() => undefined)
      .then(revealImage);
  };

  useEffect(() => {
    const recalculateZoomRatios = () => {
      Object.entries(imageElementsRef.current).forEach(([index, image]) => {
        if (image) updateZoomRatio(Number(index), image);
      });
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(recalculateZoomRatios);

    Object.values(imageElementsRef.current).forEach((image) => {
      if (image) resizeObserver?.observe(image);
    });
    window.addEventListener("resize", recalculateZoomRatios);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener("resize", recalculateZoomRatios);
    };
  }, [images, updateZoomRatio]);

  const handleImageClick = (
    event: ReactMouseEvent<HTMLImageElement>,
    index: number
  ) => {
    event.stopPropagation();

    const swiper = swiperRef.current;

    // Dùng realIndex trực tiếp, không phụ thuộc state React của frame trước.
    // allowClick chặn click phát sinh sau khi kéo/pan; kiểm tra index để
    // không thao tác nhầm ảnh cũ trong lúc hai slide đang cross-fade.
    if (
      !swiper ||
      swiper.destroyed ||
      !swiper.allowClick ||
      index !== swiper.realIndex
    ) {
      return;
    }

    // Luôn cho thu nhỏ ảnh đang zoom, kể cả khi viewport vừa thay đổi làm
    // trần zoom của ảnh giảm xuống 1.
    if (swiper.zoom.scale > 1) {
      swiper.zoom.out();
      return;
    }

    const maxRatio = updateZoomRatio(index, event.currentTarget);
    if (maxRatio === null || maxRatio <= MIN_USEFUL_ZOOM_RATIO) return;

    // Swiper đọc attribute ngay; không chờ state React commit sau click.
    event.currentTarget
      .closest(".swiper-zoom-container")
      ?.setAttribute("data-swiper-zoom", String(maxRatio));
    // Đọc giới hạn từ data-swiper-zoom và zoom từ tâm ảnh. Không truyền ratio
    // để tránh nhánh forced-zoom của Swiper 14.1 dùng lại tọa độ pan cũ.
    swiper.zoom.in();
  };

  const handleMediaGapClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const swiper = swiperRef.current;

    // Chỉ khoảng letterbox thuộc chính zoom-container mới đóng modal. Ảnh,
    // nút điều hướng và lúc đang pan/zoom đều không kích hoạt thao tác này.
    if (
      event.target !== event.currentTarget ||
      !swiper ||
      swiper.destroyed ||
      swiper.animating ||
      !swiper.allowClick ||
      swiper.zoom.scale > 1
    ) {
      return;
    }

    closeModal();
  };

  const moveToPreviousImage = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed || swiper.isBeginning) return;

    if (swiper.zoom.scale > 1) swiper.zoom.out();
    swiper.slidePrev();
  };

  const moveToNextImage = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const swiper = swiperRef.current;
    if (!swiper || swiper.destroyed || swiper.isEnd) return;

    if (swiper.zoom.scale > 1) swiper.zoom.out();
    swiper.slideNext();
  };

  return (
    <div
      role="group"
      aria-label={`Hình ảnh của bài viết: ${postTitle}`}
      className="relative h-full min-h-0 w-full overflow-hidden bg-slate-950"
    >
      {/* Giữ touch events cả khi chỉ có một ảnh để pinch/pan của Zoom hoạt
          động; Swiper tự khóa chuyển slide khi không có slide kế tiếp. */}
      <Swiper
        // Chỉ đăng ký module thực sự dùng để giữ bundle gọn. Navigation không
        // cần thiết vì hai nút Prev/Next bên dưới đang được điều khiển thủ công.
        modules={[Zoom, EffectFade]}

        // Hiệu ứng chuyển slide: fade
        effect="fade"
        fadeEffect={{ crossFade: true }}

        // Mỗi lần chỉ hiển thị đúng một ảnh và không chừa khe giữa hai slide.
        slidesPerView={1}
        spaceBetween={0}

        // Thời gian hoàn tất chuyển slide sau khi thả tay hoặc bấm Prev/Next.
        // Không ảnh hưởng tốc độ ảnh fade-in sau khi tải xong.
        speed={500}

        // Mỗi lần bấm đều đổi ảnh ngay, kể cả khi fade trước chưa kết thúc.
        // Không khóa nút bằng swiper.animating hoặc xếp hàng các lần bấm.
        preventInteractionOnTransition={false}

        // Swiper 14.1 dùng native loading="lazy". Tải trước đúng một ảnh ở
        // mỗi phía để slide kế tiếp mượt mà mà không tải đồng thời cả gallery.
        lazyPreloadPrevNext={LAZY_PRELOAD_ADJACENT_SLIDES}

        // Chỉ hiện cursor grab khi có thể đổi slide và ảnh chưa được zoom.
        grabCursor={hasMultipleImages && !isZoomed}

        // Cho phép kéo bằng chuột trên PC và vuốt/pinch trên thiết bị cảm ứng.
        simulateTouch
        allowTouchMove

        // Ngăn một dịch chuyển rất nhỏ bị hiểu nhầm là thao tác kéo slide.
        threshold={5}

        // Giữ hiệu ứng đàn hồi ở ảnh đầu/cuối nhưng giảm khoảng kéo vượt biên
        // so với mặc định của Swiper để gallery có cảm giác chắc hơn.
        resistance
        resistanceRatio={0.45}

        // Hai prop này ngăn lần thả chuột sau khi kéo bị hiểu thành click zoom
        // hoặc click khoảng trống để đóng modal.
        preventClicks
        preventClicksPropagation

        // Không cho ảnh cuối quay về ảnh đầu và ngược lại.
        loop={false}
        rewind={false}

        // Khi chỉ có một ảnh, Swiper tự khóa chức năng đổi slide; Zoom vẫn hoạt
        // động bình thường nhờ module Zoom và swiper-zoom-container.
        watchOverflow

        zoom={{
          // Trần zoom chung. data-swiper-zoom bên dưới tiếp tục giới hạn riêng
          // từng ảnh dựa trên kích thước nguồn và kích thước đang hiển thị.
          maxRatio: MAX_ZOOM_RATIO,
          minRatio: 1,

          // Không phóng vượt quá độ phân giải thật của ảnh nguồn.
          limitToOriginalSize: true,

          // Component đã xử lý single-click trong handleImageClick. Tắt cơ chế
          // double-tap mặc định để hai luồng zoom không chạy chồng lên nhau.
          toggle: false,

          // Ảnh chỉ pan khi kéo; không tự chạy theo vị trí con trỏ trên PC.
          panOnMouseMove: false,
        }}

        // Lưu instance để nút điều hướng, click zoom và gap click dùng chung.
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onBeforeDestroy={(swiper) => {
          if (swiperRef.current === swiper) swiperRef.current = null;
        }}

        // Đổi kích thước/xoay màn hình: trở về fit trước khi Swiper tính layout.
        onBeforeResize={(swiper) => {
          if (swiper.zoom.scale > 1) swiper.zoom.out();
        }}

        // realIndex vẫn đại diện đúng index ảnh gốc nếu sau này cấu hình slide
        // thay đổi. Đồng thời reset cursor zoom khi chuyển sang ảnh mới.
        onSlideChange={(swiper) => {
          if (swiper.zoom.scale > 1) swiper.zoom.out();
          setActiveIndex(swiper.realIndex);
          setIsZoomed(false);
        }}

        // zoomChange báo scale mục tiêu, không phải lúc CSS transition kết
        // thúc. Chỉ đồng bộ UI; ResizeObserver/onLoad/click lo việc đo layout.
        onZoomChange={(_, scale) => {
          setIsZoomed(scale > 1);
        }}

        // Swiper chiếm toàn bộ vùng media do modal cấp phát.
        className="h-full w-full"
      >
        {images.map((src, index) => {
          const isLoaded = loadedImageIndexes.has(index);
          const hasFailed = failedImageIndexes.has(index);
          const showBlurredBackground =
            !hasFailed && isCloudinaryImageUrl(src);
          const maxZoomRatio = zoomRatios[index] ?? 1;
          const isActiveImage = index === activeIndex;
          const canZoom = maxZoomRatio > MIN_USEFUL_ZOOM_RATIO;
          const imageLoadClassName = isLoaded
            ? "modal-post-main-image--loaded"
            : "opacity-0";
          const zoomCursorClassName =
            isActiveImage && isZoomed
              ? "cursor-zoom-out"
              : canZoom
                ? "cursor-zoom-in"
                : "cursor-default";

          return (
            <SwiperSlide
              key={`${src}-${index}`}
              className="relative !h-full !w-full overflow-hidden bg-slate-950"
            >
              {showBlurredBackground && (
                <>
                  <Image
                    src={getModalPostBackgroundImage(src)}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="(max-width: 1023px) 100vw, 75vw"
                    draggable={false}
                    unoptimized
                    className="pointer-events-none z-0 scale-110 select-none object-cover opacity-75 blur-xl"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 z-[1] bg-black/20"
                  />
                </>
              )}

              {hasFailed ? (
                <div
                  role="status"
                  className="relative z-10 flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center text-slate-300"
                >
                  <i
                    className="fa-duotone fa-image-slash text-2xl"
                    aria-hidden="true"
                  />
                  <span className="text-sm">Không thể tải hình ảnh</span>
                </div>
              ) : (
                <div
                  className="swiper-zoom-container relative z-10 flex h-full w-full items-center justify-center"
                  data-swiper-zoom={maxZoomRatio}
                  aria-busy={!isLoaded}
                  onClick={handleMediaGapClick}
                >
                  {!isLoaded && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
                    >
                      <i className="modal-post-image-spinner fad fa-spinner-third fa-spin text-xl text-white/30" />
                    </div>
                  )}

                  {/* Ảnh đầu tải ngay; các ảnh còn lại dùng native lazy load.
                      Fade chỉ bắt đầu sau onLoad + decode để không lộ frame
                      trắng giữa placeholder blur và ảnh chính. */}
                  <img
                    ref={(image) => {
                      imageElementsRef.current[index] = image;
                    }}
                    src={getBlogPostFeedLightboxImage(src)}
                    alt={`Ảnh ${index + 1} trong bài viết`}
                    loading={index === 0 ? "eager" : "lazy"}
                    decoding="async"
                    draggable={false}
                    onLoad={(event) => handleImageLoad(index, event)}
                    onError={() => handleImageError(index)}
                    onClick={(event) => handleImageClick(event, index)}
                    className={`modal-post-main-image block h-auto w-auto max-h-full max-w-full select-none object-contain ${imageLoadClassName} ${zoomCursorClassName}`}
                  />
                </div>
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>

      {hasMultipleImages && (
        <span
          aria-live="polite"
          className="pointer-events-none absolute left-3 top-3 z-20 rounded-full bg-black/55 px-2.5 py-1 text-xs text-white/90 backdrop-blur-[2px]"
        >
          {activeIndex + 1} / {images.length}
        </span>
      )}

      {showNavigationButtons && (
        <>
          <button
            type="button"
            onClick={moveToPreviousImage}
            disabled={activeIndex === 0}
            aria-label="Xem ảnh trước"
            className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus-visible:outline-none disabled:opacity-25 md:inline-flex cursor-pointer"
          >
            <i className="fad fa-arrow-left" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={moveToNextImage}
            disabled={activeIndex === images.length - 1}
            aria-label="Xem ảnh tiếp theo"
            className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus-visible:outline-none disabled:opacity-25 md:inline-flex cursor-pointer"
          >
            <i className="fad fa-arrow-right" aria-hidden="true" />
          </button>
        </>
      )}

      <style jsx global>{`
        /* Chỉ animate opacity để không can thiệp transform do Swiper Zoom
           điều khiển trực tiếp trên ảnh. */
        @keyframes modal-post-image-reveal {
          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        .modal-post-main-image--loaded {
          animation: modal-post-image-reveal 300ms ease-out both;
        }

        /* Tôn trọng thiết lập giảm chuyển động của hệ điều hành. */
        @media (prefers-reduced-motion: reduce) {
          .modal-post-main-image--loaded {
            animation: none;
            opacity: 1;
          }

          .modal-post-image-spinner {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  );
}
