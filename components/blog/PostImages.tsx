"use client";

import Image from "next/image";
import { useState } from "react";
import ImagePreview from "./ImagePreview";

export default function PostImages({ images }: { images: string[] }) {
  const count = images.length;

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openPreview = (i: number) => {
    setIndex(i);
    setOpen(true);
  };

  if (!count) return null;

  const renderImage = (
    img: string,
    i: number,
    className: string,
    sizes: string
  ) => (
    <div key={i} className={`relative ${className}`}>
      <Image
        src={img}
        alt="post"
        fill
        sizes={sizes}
        onClick={() => openPreview(i)}
        className="object-cover rounded-xl cursor-pointer hover:opacity-90"
      />
    </div>
  );

  return (
    <>
      {/* 1 */}
      {count === 1 && (
        <div className="mt-4 relative w-full aspect-[4/3]">
          <Image
            src={images[0]}
            alt="post"
            fill
            sizes="(max-width: 768px) 100vw, 800px"
            onClick={() => openPreview(0)}
            className="object-cover rounded-xl cursor-pointer"
          />
        </div>
      )}

      {/* 2 */}
      {count === 2 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.map((img, i) =>
            renderImage(img, i, "h-[280px]", "(max-width: 768px) 100vw, 50vw")
          )}
        </div>
      )}

      {/* 3 */}
      {count === 3 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {renderImage(
            images[0],
            0,
            "col-span-2 h-[300px]",
            "(max-width: 768px) 100vw, 100vw"
          )}

          {images.slice(1).map((img, i) =>
            renderImage(img, i + 1, "h-[200px]", "(max-width: 768px) 100vw, 50vw")
          )}
        </div>
      )}

      {/* 4 */}
      {count === 4 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.map((img, i) =>
            renderImage(img, i, "h-[200px]", "(max-width: 768px) 100vw, 50vw")
          )}
        </div>
      )}

      {/* >4 */}
      {count > 4 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.slice(0, 4).map((img, i) => (
            <div key={i} className="relative h-[200px]">
              <Image
                src={img}
                alt="post"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                onClick={() => openPreview(i)}
                className="object-cover rounded-xl cursor-pointer"
              />

              {i === 3 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xl rounded-xl">
                  +{count - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PREVIEW */}
      <ImagePreview
        images={images}
        index={index}
        isOpen={open}
        setIndex={setIndex}
        onClose={() => setOpen(false)}
      />
    </>
  );
}