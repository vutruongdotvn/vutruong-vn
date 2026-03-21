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

  if (count === 0) return null;

  const renderImage = (img: string, i: number, className: string) => (
    <div key={i} className={`relative ${className}`}>
      <Image
        src={img}
        alt="post"
        fill
        sizes="50vw"
        onClick={() => openPreview(i)}
        className="object-cover rounded-xl cursor-pointer hover:opacity-90 transition"
      />
    </div>
  );

  return (
    <>
      {/* LAYOUT */}
      {count === 1 && (
        <div className="mt-4 relative w-full aspect-16/9">
          <Image
            src={images[0]}
            alt="post"
            fill
            sizes="100vw"
            onClick={() => openPreview(0)}
            className="object-cover rounded-xl cursor-pointer"
          />
        </div>
      )}

      {count === 2 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.map((img, i) => renderImage(img, i, "h-[300px]"))}
        </div>
      )}

      {count === 3 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {renderImage(images[0], 0, "col-span-2 h-[300px]")}
          {images.slice(1).map((img, i) =>
            renderImage(img, i + 1, "h-[200px]")
          )}
        </div>
      )}

      {count === 4 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.map((img, i) => renderImage(img, i, "h-[200px]"))}
        </div>
      )}

      {count > 4 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.slice(0, 4).map((img, i) => (
            <div key={i} className="relative h-[200px]">
              <Image
                src={img}
                alt="post"
                fill
                sizes="50vw"
                onClick={() => openPreview(i)}
                className="object-cover rounded-xl cursor-pointer"
              />

              {i === 3 && (
                <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center text-white text-2xl font-semibold">
                  +{count - 4}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* PREVIEW */}
      {open && (
        <ImagePreview
          images={images}
          index={index}
          setIndex={setIndex}
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}