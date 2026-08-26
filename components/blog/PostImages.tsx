"use client";

import Image from "next/image";
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
  getFeedImage,
  getLightboxImage,
} from "@/lib/cloudinary";

type Props = {
  images?: string[];
  postId: string;
  priority?: boolean;
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

  /*
   * Tên nhóm Fancybox. Có thể đổi tiền tố "post-", nhưng phải luôn giữ postId
   * để ảnh của các bài viết khác nhau không bị gộp chung vào một lightbox.
   */
  const group = `post-${postId}`;
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
              image.src = getFeedImage(src);

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
     * - getFeedImage(src): URL ảnh nhẹ dùng trên PostCard.
     * - getLightboxImage(src): URL ảnh lớn mở bằng Fancybox khi bấm.
     * - className được truyền từ SwiperSlide để chỉnh bo góc/màu nền/viền.
     * - "group" + "overflow-hidden" phục vụ hiệu ứng nhấn và giữ ảnh trong bo góc.
     * - draggable={false} tránh trình duyệt kéo ảnh/link thay vì kéo slider.
     */
    return (
      <a
        href={getLightboxImage(src)}
        data-fancybox={group}
        aria-label={`Xem ảnh ${index + 1} trong bài viết`}
        draggable={false}
        className={`relative block overflow-hidden group ${className}`}
      >
        {/*
          TÙY CHỈNH HIỂN THỊ ẢNH:
          - object-cover: phủ kín khung; đổi thành object-contain nếu muốn luôn thấy
            toàn bộ ảnh và chấp nhận khoảng trống theo màu bg của khung.
          - group-active:scale-101: phóng nhẹ ảnh trong lúc nhấn; có thể bỏ nếu
            không muốn hiệu ứng phản hồi khi bấm/giữ ảnh.
          - sizes chỉ mô tả kích thước dự kiến cho trình duyệt, không quyết định
            kích thước CSS của ảnh. Kích thước hiển thị nằm ở các class bên dưới.
          - alt, aria-label và title có thể đổi nội dung chữ, không ảnh hưởng layout.
          - priority/loading nên giữ nguyên để chỉ ảnh đầu tiên được tải ưu tiên.
        */}
        <Image
          src={getFeedImage(src)}
          alt={`Ảnh ${index + 1} trong bài viết`}
          fill
          sizes={sizes}
          priority={isPriorityImage}
          loading={isPriorityImage ? "eager" : "lazy"}
          draggable={false}
          unoptimized
          title="Bấm để xem ảnh kích thước lớn"
          className="object-cover group-active:scale-101"
        />
      </a>
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
        slidesPerView="auto"
        spaceBetween={4}
        grabCursor
        simulateTouch
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
          momentumBounceRatio: 0.55,
          // Quãng đường trượt theo quán tính: thấp hơn = dừng sớm hơn.
          momentumRatio: 1.0,
          // Tốc độ quán tính: thấp hơn = chuyển động chậm và kiểm soát hơn.
          momentumVelocityRatio: 0.5,
          // Vận tốc tối thiểu để tạo quán tính; tăng lên nếu slider quá nhạy.
          minimumVelocity: 0.01,
          // false = dừng tự do; true = tự hút về vị trí đầu của slide gần nhất.
          sticky: false,
        }}
        className="h-[clamp(240px,68vw,250px)] max-h-[60svh]"
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
                // Giao diện khung: rounded-lg/xl/2xl chỉnh bo góc;
                // bg-* chỉnh nền; ring-1/ring-2 và ring-* chỉnh viền.
                "h-full w-full rounded-lg bg-slate-100 ring-1 ring-inset ring-slate-200",
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