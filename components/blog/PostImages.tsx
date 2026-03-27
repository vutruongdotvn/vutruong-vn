"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

type Props = {
  images: string[];
  postId: string;
  priority?: boolean;
};

type ImageMeta = {
  width: number;
  height: number;
};

export default function PostImages({ images, postId, priority = false }: Props) {
  const count = images.length;
  if (count === 0) return null;

  const group = `post-${postId}`;
  const [imageMeta, setImageMeta] = useState<Record<string, ImageMeta>>({});

  useEffect(() => {
    const loadImageSizes = async () => {
      const results: Record<string, ImageMeta> = {};

      await Promise.all(
        images.map(
          (src) =>
            new Promise<void>((resolve) => {
              const img = new window.Image();
              img.src = src;

              img.onload = () => {
                results[src] = {
                  width: img.naturalWidth,
                  height: img.naturalHeight,
                };
                resolve();
              };

              img.onerror = () => {
                results[src] = {
                  width: 1200,
                  height: 900,
                };
                resolve();
              };
            })
        )
      );

      setImageMeta(results);
    };

    loadImageSizes();
  }, [images]);

  const getRatio = (src: string) => {
    const meta = imageMeta[src];
    if (!meta) return 1.333;
    return meta.width / meta.height;
  };

  const isLandscape = (src: string) => getRatio(src) >= 1.15;

  // ===== SMART HERO PICKER =====
  const heroIndex = useMemo(() => {
    if (count < 3) return 0;

    let bestIndex = 0;
    let bestScore = -999;

    images.forEach((img, i) => {
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
  }, [count, images, imageMeta]);

  const orderedImages = useMemo(() => {
    if (count < 3) return images;
    const cloned = [...images];
    const [hero] = cloned.splice(heroIndex, 1);
    return [hero, ...cloned];
  }, [images, heroIndex, count]);

  const visibleImages = count <= 5 ? orderedImages : orderedImages.slice(0, 5);
  const hiddenImages = count > 5 ? orderedImages.slice(5) : [];

  const renderImage = (
    img: string,
    i: number,
    className: string,
    sizes: string,
    overlay?: React.ReactNode
  ) => (
    <a
      key={`${img}-${i}`}
      href={img}
      data-fancybox={group}
      className={`relative block overflow-hidden rounded-2xl group ${className}`}
    >
      <Image
        loading="eager"
        src={img}
        alt="post"
        fill
        sizes={sizes}
        priority={priority && i === 0}
        className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.025]"
        title="Bấm để xem ảnh chất lượng cao"
      />

      {/* Cinematic overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.04] via-transparent to-white/[0.04]" />

      {overlay}
    </a>
  );

  // ===== SINGLE IMAGE =====
  const firstImage = images[0];
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

  // ===== SMART LAYOUT DETECT =====
  const smartLayout = useMemo(() => {
    if (count === 3) {
      const hasLandscape = orderedImages.some((img) => isLandscape(img));
      return hasLandscape ? "3-top-hero" : "3-left-hero";
    }

    if (count === 4) return "4-grid";
    if (count >= 5) return "4-grid";

    return null;
  }, [count, orderedImages, imageMeta]);

  return (
    <>
      {/* 1 IMAGE */}
      {count === 1 && (
        <div
          className={`postImages relative mt-3 overflow-hidden select-none max-h-[78vh] px-3 ${getSingleImageClass()}`}
          style={getSingleImageStyle()}
        >
          {renderImage(
            firstImage,
            0,
            "w-full h-full",
            "(max-width:768px) 100vw, 800px"
          )}
        </div>
      )}

      {/* 2 IMAGES */}
      {count === 2 && (
        <div className="postImages grid grid-cols-2 gap-[6px] mt-3 select-none overflow-hidden px-3">
          {images.map((img, i) =>
            renderImage(
              img,
              i,
              "aspect-[4/3]",
              "(max-width:768px) 50vw, 400px"
            )
          )}
        </div>
      )}

      {/* 3 IMAGES - TOP HERO */}
      {count === 3 && smartLayout === "3-top-hero" && (
        <div className="postImages mt-3 grid gap-[6px] select-none overflow-hidden px-3">
          <div className="relative w-full aspect-[16/9]">
            {renderImage(
              orderedImages[0],
              0,
              "w-full h-full",
              "(max-width:768px) 100vw, 800px"
            )}
          </div>

          <div className="grid grid-cols-2 gap-[6px]">
            {orderedImages.slice(1, 3).map((img, idx) =>
              renderImage(
                img,
                idx + 1,
                "aspect-[4/3]",
                "(max-width:768px) 50vw, 400px"
              )
            )}
          </div>
        </div>
      )}

      {/* 3 IMAGES - LEFT HERO */}
      {count === 3 && smartLayout === "3-left-hero" && (
        <div className="postImages grid grid-cols-2 gap-[6px] 3 select-none aspect-[4/3] overflow-hidden px-3">
          {renderImage(
            orderedImages[0],
            0,
            "h-full",
            "(max-width:768px) 50vw, 400px"
          )}

          <div className="grid grid-rows-2 gap-[6px] h-full">
            {orderedImages.slice(1, 3).map((img, idx) =>
              renderImage(
                img,
                idx + 1,
                "h-full",
                "(max-width:768px) 50vw, 400px"
              )
            )}
          </div>
        </div>
      )}

      {/* 4 IMAGES */}
      {count === 4 && (
        <div className="postImages grid grid-cols-2 gap-[6px] mt-3 select-none overflow-hidden px-3">
          {images.slice(0, 4).map((img, i) =>
            renderImage(
              img,
              i,
              "aspect-[4/3]",
              "(max-width:768px) 50vw, 400px"
            )
          )}
        </div>
      )}

      {/* 5+ IMAGES */}
      {count >= 5 && (
        <div className="postImages grid grid-cols-2 gap-[6px] mt-3 select-none overflow-hidden px-3">
          {images.slice(0, 4).map((img, i) =>
            renderImage(
              img,
              i,
              "aspect-[4/3]",
              "(max-width:768px) 50vw, 400px",
              i === 3 ? (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-2xl font-semibold pointer-events-none backdrop-blur-[2px]">
                  +{count - 4}
                </div>
              ) : null
            )
          )}
        </div>
      )}

      {/* Hidden fancybox images */}
      {hiddenImages.length > 0 && (
        <div className="hidden">
          {hiddenImages.map((img, i) => (
            <a key={`hidden-${i}`} href={img} data-fancybox={group} />
          ))}
        </div>
      )}
    </>
  );
}