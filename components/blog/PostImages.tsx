"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
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

export default function PostImages({
  images = [],
  postId,
  priority = false,
}: Props) {
  // Memo để tránh tạo array mới mỗi render
  const safeImages = useMemo(() => {
    return Array.isArray(images)
      ? images.filter((img) => typeof img === "string" && img.trim() !== "")
      : [];
  }, [images]);

  const count = safeImages.length;
  const group = `post-${postId}`;
  const [imageMeta, setImageMeta] = useState<Record<string, ImageMeta>>({});
  const imageMetaCacheRef = useRef<Record<string, ImageMeta>>({});

  useEffect(() => {
    if (count === 0) {
      setImageMeta((prev) => (Object.keys(prev).length ? {} : prev));
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
              // 1) Nếu đã có cache -> dùng luôn
              if (imageMetaCacheRef.current[src]) {
                results[src] = imageMetaCacheRef.current[src];
                resolve();
                return;
              }

              // 2) Nếu parse được metadata từ URL transform -> dùng luôn
              const parsed = extractCloudinaryMeta(src);
              if (parsed) {
                results[src] = parsed;
                imageMetaCacheRef.current[src] = parsed;
                resolve();
                return;
              }

              // 3) Fallback thật sự cần mới load ảnh
              const img = new window.Image();
              img.decoding = "async";
              // img.loading = "eager";
              img.src = getFeedImage(src);

              img.onload = () => {
                const meta = {
                  width: img.naturalWidth || 1200,
                  height: img.naturalHeight || 900,
                };

                results[src] = meta;
                imageMetaCacheRef.current[src] = meta;
                resolve();
              };

              img.onerror = () => {
                const fallback = {
                  width: 1200,
                  height: 900,
                };

                results[src] = fallback;
                imageMetaCacheRef.current[src] = fallback;
                resolve();
              };
            })
        )
      );

      if (!isMounted) return;

      setImageMeta((prev) => {
        const prevStr = JSON.stringify(prev);
        const nextStr = JSON.stringify(results);
        return prevStr === nextStr ? prev : results;
      });
    };

    loadImageSizes();

    return () => {
      isMounted = false;
    };
  }, [safeImages, count]);
  // End optimize image postcard

  const getRatio = (src: string) => {
    const meta = imageMeta[src];
    if (!meta) return 1.333;
    return meta.width / meta.height;
  };

  const isLandscape = (src: string) => getRatio(src) >= 1.15;

  const isPortrait = (src: string) => getRatio(src) <= 0.9;

  const getTwoImageAspectClass = () => {
    if (safeImages.length !== 2) return "aspect-square";

    const [img1, img2] = safeImages;

    const firstIsPortrait = isPortrait(img1);
    const secondIsPortrait = isPortrait(img2);

    const firstIsLandscape = isLandscape(img1);
    const secondIsLandscape = isLandscape(img2);

    // Cả 2 đều dọc
    if (firstIsPortrait && secondIsPortrait) {
      return "aspect-[3/4]";
    }

    // Cả 2 đều ngang
    if (firstIsLandscape && secondIsLandscape) {
      return "aspect-[4/3]";
    }

    // 1 dọc 1 ngang hoặc tỉ lệ không đồng bộ
    return "aspect-square";
  };

  const heroIndex = useMemo(() => {
    if (count < 3) return 0;

    let bestIndex = 0;
    let bestScore = -999;

    safeImages.forEach((img, i) => {
      const ratio = getRatio(img);
      let score = 0;

      if (ratio >= 1.6) score += 100;
      else if (ratio >= 1.15) score += 70;
      else if (ratio >= 1) score += 40;
      else if (ratio >= 0.75) score += 10;
      else score -= 20;

      if (i === 0) score += 12;
      if (i === 1) score += 6;

      if (ratio > 2.4) score -= 15;
      if (ratio < 0.6) score -= 15;

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    });

    return bestIndex;
  }, [count, safeImages, imageMeta]);

  const orderedImages = useMemo(() => {
    if (count < 3) return safeImages;
    const cloned = [...safeImages];
    const [hero] = cloned.splice(heroIndex, 1);
    return [hero, ...cloned];
  }, [safeImages, heroIndex, count]);

  // Luôn hiển thị 4 ảnh trong layout 4+; hidden = tất cả từ ảnh thứ 5 trở đi
  const visibleImages = orderedImages.slice(0, 4);
  const hiddenImages = count > 4 ? orderedImages.slice(4) : [];

  if (count === 0) return null;

  const renderImage = (
    img: string,
    i: number,
    className: string,
    sizes: string,
    overlay?: React.ReactNode
  ) => {
    const lightboxUrl = getLightboxImage(img);
    const isPriorityImage = priority && i === 0;

    return (
      <a
        key={`${img}-${i}`}
        href={lightboxUrl}
        data-fancybox={group}
        className={`relative block overflow-hidden group ${className}`}
      >
        <Image
          src={getFeedImage(img)}
          alt="post"
          fill
          sizes={sizes}
          priority={isPriorityImage}
          loading={isPriorityImage ? "eager" : "lazy"}
          unoptimized title="Bấm để xem ảnh kích thước lớn"
          className="object-cover transition-transform duration-3000 ease-out group-hover:scale-[1.075]"
        />
        {overlay}
      </a>
    );
  };

  const firstImage = safeImages[0];
  const firstMeta = imageMeta[firstImage];

  const getSingleImageClass = () => {
    if (!firstMeta) return "w-full aspect-[4/3]";
    const ratio = firstMeta.width / firstMeta.height;
    if (ratio >= 1) return "w-full";
    return "w-full aspect-[3/4]";
  };

  const getSingleImageStyle = () => {
    if (!firstMeta) return undefined;
    const ratio = firstMeta.width / firstMeta.height;
    if (ratio >= 1) {
      return {
        aspectRatio: `${firstMeta.width} / ${firstMeta.height}`,
      };
    }
    return undefined;
  };

  const smartLayout = useMemo(() => {
    if (count === 3) {
      const hasLandscape = orderedImages.some((img) => isLandscape(img));
      return hasLandscape ? "3-top-hero" : "3-left-hero";
    }

    if (count === 4) return "4-grid";
    if (count >= 5) return "4-grid";

    return null;
  }, [count, orderedImages]);

  return (
    <>
      {count === 1 && (
        <div
          className={`postImages relative mt-3 overflow-hidden select-none max-h-[78vh] ${getSingleImageClass()}`}
          style={getSingleImageStyle()}
        >
          {renderImage(
            firstImage,
            0,
            "w-full h-full",
            "(max-width:640px) 100vw, (max-width:1024px) 80vw, 800px"
          )}
        </div>
      )}

      {count === 2 && (
        <div className="postImages grid grid-cols-2 gap-0.5 mt-3 select-none overflow-hidden">
          {safeImages.map((img, i) =>
            renderImage(
              img,
              i,
              getTwoImageAspectClass(),
              "(max-width:640px) 50vw, (max-width:1024px) 40vw, 400px"
            )
          )}
        </div>
      )}

      {count === 3 && smartLayout === "3-top-hero" && (
        <div className="postImages mt-3 grid gap-0.5 select-none overflow-hidden">
          <div className="relative w-full aspect-video">
            {renderImage(
              orderedImages[0],
              0,
              "w-full h-full",
              "(max-width:640px) 100vw, (max-width:1024px) 80vw, 800px"
            )}
          </div>

          <div className="grid grid-cols-2 gap-0.5">
            {orderedImages.slice(1, 3).map((img, idx) =>
              renderImage(
                img,
                idx + 1,
                "aspect-[4/3]",
                "(max-width:640px) 50vw, (max-width:1024px) 40vw, 400px"
              )
            )}
          </div>
        </div>
      )}

      {count === 3 && smartLayout === "3-left-hero" && (
        <div className="postImages grid grid-cols-2 gap-0.5 select-none aspect-[4/3] overflow-hidden mt-3">
          {renderImage(
            orderedImages[0],
            0,
            "h-full",
            "(max-width:640px) 50vw, (max-width:1024px) 40vw, 400px"
          )}

          <div className="grid grid-rows-2 gap-0.5 h-full">
            {orderedImages.slice(1, 3).map((img, idx) =>
              renderImage(
                img,
                idx + 1,
                "h-full",
                "(max-width:640px) 50vw, (max-width:1024px) 40vw, 400px"
              )
            )}
          </div>
        </div>
      )}

      {count === 4 && (
        <div className="postImages grid grid-cols-2 gap-0.5 mt-3 select-none overflow-hidden">
          {orderedImages.slice(0, 4).map((img, i) =>
            renderImage(
              img,
              i,
              "aspect-[4/3]",
              "(max-width:640px) 50vw, (max-width:1024px) 40vw, 400px"
            )
          )}
        </div>
      )}

      {count >= 5 && (
        <div className="postImages grid grid-cols-2 gap-0.5 mt-3 select-none overflow-hidden">
          {visibleImages.map((img, i) =>
            renderImage(
              img,
              i,
              "aspect-[4/3]",
              "(max-width:640px) 50vw, (max-width:1024px) 40vw, 400px",
              i === 3 ? (
                <div className="absolute inset-0 bg-black/25 flex items-center justify-center text-white text-lg pointer-events-none">
                  +{count - 4}
                </div>
              ) : null
            )
          )}
        </div>
      )}

      {hiddenImages.length > 0 && (
        <div className="hidden">
          {hiddenImages.map((img, i) => (
            <a key={`hidden-${i}`} href={getLightboxImage(img)} data-fancybox={group} />
          ))}
        </div>
      )}
    </>
  );
}