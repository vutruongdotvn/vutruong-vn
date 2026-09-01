"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

/*
 * CSS bắt buộc của Swiper:
 * - "swiper/css": cấu trúc và chuyển động cốt lõi của slider.
 * - "swiper/css/free-mode": chuyển động tự do có quán tính.
 * Không dùng "swiper/css/bundle" để tránh tải CSS của các tính năng không dùng.
 * Chỉ xóa các import này khi bạn đã tự viết đầy đủ CSS thay thế.
 */
import "swiper/css";
import "swiper/css/free-mode";

import {
  extractCloudinaryMeta,
  getBlogPostFeedImage,
  getBlogPostFeedLightboxImage,
} from "@/lib/cloudinary";
import { getPostImagePath } from "@/lib/postImageRoute";

type Props = {
  images?: string[];
  postId: string;
  priority?: boolean;
  openPostOnClick?: boolean;
};

type ImageMeta = {
  width: number;
  height: number;
};

/*
 * TỈ LỆ DỰ PHÒNG:
 * Chỉ được dùng trong lúc chưa đọc xong metadata hoặc khi ảnh bị lỗi.
 * - 4 / 3: ngang nhẹ, đang dùng.
 * - 1 / 1: vuông.
 * - 16 / 9: ngang rộng.
 * Giá trị này không thay đổi tỉ lệ của ảnh đã đọc được metadata thật.
 */
const FALLBACK_IMAGE_META: ImageMeta = {
  width: 4,
  height: 3,
};

/*
 * CÁC MODULE ĐANG DÙNG:
 * - FreeMode: kéo/vuốt tự do, quán tính và nảy ở mép.
 * Không dùng Mousewheel để con lăn/trackpad không điều khiển slider.
 */
const SWIPER_MODULES = [FreeMode];

export default function PostImages({
  images,
  postId,
  priority = false,
  openPostOnClick = false,
}: Props) {
  const safeImages = useMemo(
    () =>
      Array.isArray(images)
        ? images.filter(
            (image): image is string =>
              typeof image === "string" && image.trim() !== ""
          )
        : [],
    [images]
  );

  const count = safeImages.length;
  const [imageMeta, setImageMeta] = useState<Record<string, ImageMeta>>({});
  const imageMetaCacheRef = useRef<Record<string, ImageMeta>>({});
  const swiperRef = useRef<SwiperInstance | null>(null);

  useEffect(() => {
    if (count === 0) {
      setImageMeta((current) =>
        Object.keys(current).length > 0 ? {} : current
      );
      imageMetaCacheRef.current = {};
      return;
    }

    let isMounted = true;

    const loadImageSizes = async () => {
      const results: Record<string, ImageMeta> = {};

      await Promise.all(
        safeImages.map(
          (src) =>
            new Promise<void>((resolve) => {
              const cached = imageMetaCacheRef.current[src];

              if (cached) {
                results[src] = cached;
                resolve();
                return;
              }

              const parsed = extractCloudinaryMeta(src);

              if (parsed) {
                results[src] = parsed;
                imageMetaCacheRef.current[src] = parsed;
                resolve();
                return;
              }

              const image = new window.Image();
              image.decoding = "async";
              image.src = getBlogPostFeedImage(src);

              image.onload = () => {
                const meta = {
                  // 1200 x 900 chỉ là kích thước dự phòng 4:3 nếu trình duyệt
                  // không trả về naturalWidth/naturalHeight. Có thể đổi cùng tỉ lệ.
                  width: image.naturalWidth || 1200,
                  height: image.naturalHeight || 900,
                };

                results[src] = meta;
                imageMetaCacheRef.current[src] = meta;
                resolve();
              };

              image.onerror = () => {
                results[src] = FALLBACK_IMAGE_META;
                imageMetaCacheRef.current[src] = FALLBACK_IMAGE_META;
                resolve();
              };
            })
        )
      );

      if (!isMounted) return;

      setImageMeta((current) => {
        const currentEntries = Object.entries(current);
        const nextEntries = Object.entries(results);
        const isUnchanged =
          currentEntries.length === nextEntries.length &&
          nextEntries.every(
            ([src, meta]) =>
              current[src]?.width === meta.width &&
              current[src]?.height === meta.height
          );

        return isUnchanged ? current : results;
      });
    };

    void loadImageSizes();

    return () => {
      isMounted = false;
    };
  }, [count, safeImages]);

  useEffect(() => {
    swiperRef.current?.update();
  }, [imageMeta, safeImages]);

  if (count === 0) return null;

  const getMeta = (src: string) => imageMeta[src] ?? FALLBACK_IMAGE_META;

  const renderImage = (
    src: string,
    index: number,
    className: string,
    sizes: string
  ) => {
    const isPriorityImage = priority && index === 0;

    /*
     * TÙY CHỈNH CHUNG CHO MỌI ẢNH TRONG SLIDER:
     * - Feed và carousel trang chi tiết dùng bản 800 px để giữ URL nhẹ.
     * - ModalFullPost có renderer riêng và dùng bản 2560 px.
     * - Ở trang chi tiết, bản Fancybox 2560 px chỉ tải sau thao tác click.
     * - className được truyền từ SwiperSlide để chỉnh bo góc/màu nền/viền.
     * - draggable={false} tránh trình duyệt kéo ảnh/link thay vì kéo slider.
     */
    const imageElement = (
      <Image
        src={getBlogPostFeedImage(src)}
        alt={`Ảnh ${index + 1} trong bài viết`}
        fill
        sizes={sizes}
        priority={isPriorityImage}
        loading={isPriorityImage ? "eager" : "lazy"}
        draggable={false}
        unoptimized
        title={
          openPostOnClick
            ? "Mở bài viết chi tiết"
            : "Bấm để xem ảnh kích thước lớn"
        }
        className="object-cover group-active:scale-101"
      />
    );

    const containerClassName = `relative block overflow-hidden group ${className}`;

    if (!openPostOnClick) {
      return (
        <a
          href={getBlogPostFeedLightboxImage(src)}
          data-fancybox={`post-${postId}`}
          aria-label={`Xem ảnh ${index + 1} trong bài viết`}
          draggable={false}
          onClick={(event) => {
            if (swiperRef.current && !swiperRef.current.allowClick) {
              event.preventDefault();
              event.stopPropagation();
            }
          }}
          className={`${containerClassName} cursor-zoom-in`}
        >
          {imageElement}
        </a>
      );
    }

    return (
      <Link
        href={getPostImagePath(postId, src)}
        prefetch={false}
        scroll={false}
        aria-label={`Mở bài viết để xem ảnh ${index + 1}`}
        draggable={false}
        onClick={(event) => {
          // Swiper đặt allowClick=false sau một thao tác kéo. Chặn Link trong
          // trường hợp đó để thả chuột/ngón tay không vô tình mở modal.
          if (swiperRef.current && !swiperRef.current.allowClick) {
            event.preventDefault();
            event.stopPropagation();
          }
        }}
        className={containerClassName}
      >
        {imageElement}
      </Link>
    );
  };

  /*
   * ========================================================================
   * TÙY CHỈNH LAYOUT SLIDER (áp dụng cho mọi bài viết có ít nhất 1 ảnh)
   * ========================================================================
   *
   * KÍCH THƯỚC ẢNH/KHUNG SLIDER — vị trí quan trọng nhất:
   * className hiện tại:
   *   h-[clamp(180px,68vw,240px)] max-h-[70svh]
   * Trong clamp(MIN, FLUID, MAX):
   * - 180px: chiều cao nhỏ nhất.
   * - 68vw: chiều cao co giãn theo 68% chiều rộng viewport.
   * - 240px: chiều cao lớn nhất.
   * - 70svh: không cho slider cao quá 70% chiều cao màn hình nhỏ.
   *
   * Một số preset để bạn tự thay nguyên chuỗi className của Swiper:
   * - Nhỏ gọn: h-[clamp(160px,55vw,220px)] max-h-[60svh]
   * - Hiện tại: h-[clamp(180px,68vw,240px)] max-h-[70svh]
   * - Lớn hơn:  h-[clamp(220px,65vw,360px)] max-h-[70svh]
   * - Theo breakpoint: h-[260px] sm:h-[300px] lg:h-[340px]
   *
   * KHOẢNG CÁCH:
   * - mt-3 trên div ngoài: khoảng cách 12 px với nội dung phía trên.
   * - spaceBetween={4}: gap 4 px giữa các ảnh.
   *   Có thể dùng 6 hoặc 8 nếu muốn khoảng cách thoáng hơn.
   *
   * CÁC GIÁ TRỊ NÊN GIỮ:
   * - slidesPerView="auto": bắt buộc để mỗi ảnh có chiều rộng theo tỉ lệ thật.
   * - !h-full !w-auto và style aspectRatio ở SwiperSlide: bắt buộc để ảnh ngang,
   *   dọc và vuông không bị ép về cùng một tỉ lệ.
   * - overflow-hidden trên div ngoài: cắt phần slide nằm ngoài PostCard.
   *
   * TƯƠNG TÁC:
   * - grabCursor: hiện con trỏ bàn tay khi rê chuột.
   * - simulateTouch: cho phép giữ và kéo bằng chuột giống thao tác cảm ứng.
   * - onTouchStart: chỉ tinh chỉnh physics khi input thực tế là touch/pen;
   *   chuột vẫn được trả về đúng toàn bộ thông số hiện tại.
   * - watchOverflow={false}: không tự khóa khi 1 hoặc 2 ảnh đã vừa khung,
   *   nhờ đó vẫn có thể kéo/vuốt và thấy hiệu ứng nảy ở hai mép.
   * - resistance/resistanceRatio: độ kháng và độ kéo quá mép.
   */
  return (
    <div className="postImages mt-3 select-none overflow-hidden px-3 sm:px-4">
      <Swiper
        modules={SWIPER_MODULES}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        onTouchStart={(swiper, event) => {
          const isTouchInput =
            ("pointerType" in event && event.pointerType !== "mouse") ||
            event.type.startsWith("touch");

          /*
           * TOUCH/MOBILE:
           * - threshold 2: phản hồi sớm hơn theo chuyển động ngón tay.
           * - resistance 0.85: kéo ở hai mép mềm và tự nhiên hơn.
           * - minimumVelocity 0.02: loại bỏ quán tính từ những rung/chạm rất nhỏ.
           *
           * MOUSE/PC:
           * Khôi phục nguyên các giá trị 0.4 / 1 / 1 / 1 / 0 của file gốc.
           * Không có bất kỳ thay đổi nào đối với layout hoặc tỉ lệ ảnh.
           */
          swiper.params.threshold = isTouchInput ? 2 : 5;
          swiper.params.resistanceRatio = isTouchInput ? 0.85 : 0.4;

          if (
            swiper.params.freeMode &&
            typeof swiper.params.freeMode === "object"
          ) {
            Object.assign(swiper.params.freeMode, {
              momentumBounceRatio: isTouchInput ? 0.85 : 1,
              momentumRatio: 1,
              momentumVelocityRatio: 1,
              minimumVelocity: isTouchInput ? 0.02 : 0,
            });
          }
        }}
        slidesPerView="auto"
        spaceBetween={3}
        grabCursor
        simulateTouch
        preventClicks
        preventClicksPropagation
        watchOverflow={false}
        resistance
        resistanceRatio={
          /* 0 = mép rất cứng; càng gần 1 càng kéo vượt mép nhiều. 0.3–0.5 là nhẹ. */
          0.4
        }
        freeMode={{
          // Bật chế độ cuộn tự do, không bắt buộc dừng đúng từng slide.
          enabled: true,
          // Cho slider tiếp tục trượt một đoạn sau khi thả tay/chuột.
          momentum: true,
          // Bật hiệu ứng nảy trở lại khi trượt quá điểm đầu/cuối.
          momentumBounce: true,
          // Độ nảy: càng lớn càng nảy mạnh. Có thể thử khoảng 0.3–0.8.
          momentumBounceRatio: 0.2,
          // Quãng đường trượt theo quán tính: thấp hơn = dừng sớm hơn.
          momentumRatio: 0.5,
          // Tốc độ quán tính: thấp hơn = chuyển động chậm và kiểm soát hơn.
          momentumVelocityRatio: 0.5,
          // Vận tốc tối thiểu để tạo quán tính; tăng lên nếu slider quá nhạy.
          minimumVelocity: 0.5,
          // false = dừng tự do; true = tự hút về vị trí đầu của slide gần nhất.
          sticky: false,
        }}
        className="h-[clamp(180px,68vw,180px)] md:h-[clamp(180px,68vw,250px)] max-h-[60svh]"
      >
        {safeImages.map((src, index) => {
          const meta = getMeta(src);

          /*
           * TÙY CHỈNH TỪNG THẺ ẢNH:
           * - !h-full: mọi slide dùng chung chiều cao của Swiper.
           * - !w-auto: chiều rộng được tự tính từ chiều cao + aspectRatio thật.
           * - flex-none: không cho flex co ảnh lại.
           * Ba giá trị trên nên giữ nếu muốn layout giống Threads và đúng tỉ lệ.
           */
          return (
            <SwiperSlide
              key={`${src}-${index}`}
              className="!h-full !w-auto flex-none"
              style={{ aspectRatio: `${meta.width} / ${meta.height}` }}
            >
              {renderImage(
                src,
                index,
                // bg-* chỉnh nền; ring-1/ring-2 và ring-* chỉnh viền.
                "h-full w-full rounded-xl",
                // Gợi ý kích thước tải; không thay đổi chiều cao/chiều rộng CSS.
                "(max-width:640px) 90vw, (max-width:1024px) 70vw, 720px"
              )}
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
