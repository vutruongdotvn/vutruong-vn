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
import { EffectFade, Zoom } from "swiper/modules";
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

const MAX_ZOOM_RATIO = 3;
const MIN_USEFUL_ZOOM_RATIO = 1.05;

export default function ModalPostMedia({
  images,
  postTitle,
}: ModalPostMediaProps) {
  const router = useRouter();
  const swiperRef = useRef<SwiperInstance | null>(null);
  const imageElementsRef = useRef<Record<number, HTMLImageElement | null>>({});
  const isClosingRef = useRef(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [zoomScale, setZoomScale] = useState(1);
  const [zoomRatios, setZoomRatios] = useState<Record<number, number>>({});
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
      if (
        !image.isConnected ||
        !image.complete ||
        (swiperRef.current?.zoom.scale ?? 1) > 1
      ) {
        return;
      }

      const bounds = image.getBoundingClientRect();
      if (
        bounds.width <= 0 ||
        bounds.height <= 0 ||
        image.naturalWidth <= 0 ||
        image.naturalHeight <= 0
      ) {
        return;
      }

      const originalSizeRatio =
        Math.round(
          Math.min(
            image.naturalWidth / bounds.width,
            image.naturalHeight / bounds.height,
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
    },
    []
  );

  const handleImageLoad = (
    index: number,
    event: SyntheticEvent<HTMLImageElement>
  ) => {
    const image = event.currentTarget;

    // Đợi trình duyệt hoàn tất bước contain để so kích thước nguồn với đúng
    // kích thước ảnh đang hiển thị, tránh cho zoom ảnh nhỏ vượt quá ảnh gốc.
    window.requestAnimationFrame(() => updateZoomRatio(index, image));
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
    const maxRatio = zoomRatios[index] ?? 1;

    // Swiper đặt allowClick=false sau thao tác kéo. Không biến lần thả chuột
    // hoặc ngón tay đó thành thao tác zoom ngoài ý muốn.
    if (
      !swiper ||
      !swiper.allowClick ||
      index !== activeIndex ||
      maxRatio <= MIN_USEFUL_ZOOM_RATIO
    ) {
      return;
    }

    if (swiper.zoom.scale > 1) {
      swiper.zoom.out();
      return;
    }

    swiper.zoom.in(maxRatio);
  };

  const handleMediaGapClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    const swiper = swiperRef.current;

    // Chỉ khoảng letterbox thuộc chính zoom-container mới đóng modal. Ảnh,
    // nút điều hướng và lúc đang pan/zoom đều không kích hoạt thao tác này.
    if (
      event.target !== event.currentTarget ||
      !swiper?.allowClick ||
      swiper.zoom.scale > 1
    ) {
      return;
    }

    closeModal();
  };

  const moveToPreviousImage = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const swiper = swiperRef.current;
    if (!swiper || swiper.isBeginning) return;

    swiper.zoom.out();
    swiper.slidePrev();
  };

  const moveToNextImage = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const swiper = swiperRef.current;
    if (!swiper || swiper.isEnd) return;

    swiper.zoom.out();
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
        modules={[Zoom, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        slidesPerView={1}
        spaceBetween={0}
        speed={500}
        grabCursor={hasMultipleImages && zoomScale <= 1}
        simulateTouch
        allowTouchMove
        resistance
        resistanceRatio={0.45}
        watchOverflow
        zoom={{
          maxRatio: MAX_ZOOM_RATIO,
          minRatio: 1,
          limitToOriginalSize: true,
          toggle: false,
        }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
          setZoomScale(1);
        }}
        onZoomChange={(_, scale) => {
          setZoomScale(scale);

          if (scale <= 1) {
            const image = imageElementsRef.current[activeIndex];

            if (image) {
              window.requestAnimationFrame(() =>
                updateZoomRatio(activeIndex, image)
              );
            }
          }
        }}
        className="h-full w-full"
      >
        {images.map((src, index) => {
          const hasFailed = failedImageIndexes.has(index);
          const showBlurredBackground =
            !hasFailed && isCloudinaryImageUrl(src);
          const maxZoomRatio = zoomRatios[index] ?? 1;
          const isActiveImage = index === activeIndex;
          const canZoom = maxZoomRatio > MIN_USEFUL_ZOOM_RATIO;

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
                  onClick={handleMediaGapClick}
                >
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
                    className={`block h-auto w-auto max-h-full max-w-full select-none object-contain ${canZoom
                      ? isActiveImage && zoomScale > 1
                        ? "cursor-zoom-out"
                        : "cursor-zoom-in"
                      : "cursor-default"
                      }`}
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
            className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0 md:inline-flex cursor-pointer"
          >
            <i className="fad fa-arrow-left" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={moveToNextImage}
            disabled={activeIndex === images.length - 1}
            aria-label="Xem ảnh tiếp theo"
            className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white/90 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white focus-visible:outline-none disabled:pointer-events-none disabled:opacity-0 md:inline-flex cursor-pointer"
          >
            <i className="fad fa-arrow-right" aria-hidden="true" />
          </button>
        </>
      )}
    </div>
  );
}
