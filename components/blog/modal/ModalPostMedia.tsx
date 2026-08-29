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
  const hasMultipleImages = images.length > 1;

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
        {images.map((src, index) => (
          <SwiperSlide key={`${src}-${index}`} className="!h-full !w-full">
            <div className="relative h-full w-full">
              <Image
                src={getModalFullPostImage(src)}
                alt={`Ảnh ${index + 1} trong bài viết`}
                fill
                sizes="(max-width: 1023px) 100vw, 48vw"
                priority={index === 0}
                loading={index === 0 ? "eager" : "lazy"}
                draggable={false}
                unoptimized
                className="select-none object-contain"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {hasMultipleImages && (
        <span
          aria-live="polite"
          className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 rounded-full bg-black/55 px-2.5 py-1 text-xs font-medium text-white/90 backdrop-blur-[2px]"
        >
          {activeIndex + 1} / {images.length}
        </span>
      )}
    </div>
  );
}
