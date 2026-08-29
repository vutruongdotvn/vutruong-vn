"use client";

import Image from "next/image";
import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

import { getModalFullPostImage } from "@/lib/cloudinary";

type ModalPostMediaProps = {
  images: string[];
  postTitle: string;
};

export default function ModalPostMedia({
  images,
  postTitle,
}: ModalPostMediaProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedImageIndexes, setFailedImageIndexes] = useState<Set<number>>(
    () => new Set()
  );
  const hasMultipleImages = images.length > 1;

  const handleImageError = (index: number) => {
    setFailedImageIndexes((currentIndexes) => {
      if (currentIndexes.has(index)) return currentIndexes;

      const nextIndexes = new Set(currentIndexes);
      nextIndexes.add(index);
      return nextIndexes;
    });
  };

  return (
    <div
      role="group"
      aria-label={`Hình ảnh của bài viết: ${postTitle}`}
      className="relative h-full min-h-0 w-full overflow-hidden bg-slate-950"
    >
      <Swiper
        slidesPerView={1}
        spaceBetween={0}
        speed={220}
        grabCursor={hasMultipleImages}
        simulateTouch={hasMultipleImages}
        allowTouchMove={hasMultipleImages}
        resistance
        resistanceRatio={0.45}
        watchOverflow
        onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        className="h-full w-full"
      >
        {images.map((src, index) => {
          const hasFailed = failedImageIndexes.has(index);

          return (
            <SwiperSlide key={`${src}-${index}`} className="!h-full !w-full">
              <div className="relative h-full w-full">
                {hasFailed ? (
                  <div
                    role="status"
                    className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center text-slate-400"
                  >
                    <i
                      className="fa-duotone fa-image-slash text-2xl"
                      aria-hidden="true"
                    />
                    <span className="text-sm">Không thể tải hình ảnh</span>
                  </div>
                ) : (
                  <Image
                    src={getModalFullPostImage(src)}
                    alt={`Ảnh ${index + 1} trong bài viết`}
                    fill
                    sizes="(max-width: 1023px) 100vw, 56vw"
                    priority={index === 0}
                    loading={index === 0 ? "eager" : "lazy"}
                    draggable={false}
                    unoptimized
                    onError={() => handleImageError(index)}
                    className="select-none object-contain"
                  />
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {hasMultipleImages && (
        <span
          aria-live="polite"
          className="pointer-events-none absolute left-3 top-3 z-10 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-[2px]"
        >
          {activeIndex + 1} / {images.length}
        </span>
      )}
    </div>
  );
}
