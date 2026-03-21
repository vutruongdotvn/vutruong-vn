"use client";

import Image from "next/image";
import { useEffect } from "react";

type Props = {
  images: string[];
  index: number;
  onClose: () => void;
  setIndex: (i: number) => void;
};

export default function ImagePreview({
  images,
  index,
  onClose,
  setIndex,
}: Props) {
  const total = images.length;

  const prev = () => setIndex((index - 1 + total) % total);
  const next = () => setIndex((index + 1) % total);

  // ESC + Arrow key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [index]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      {/* IMAGE */}
      <div
        className="relative w-full max-w-5xl h-[80vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt="preview"
          fill
          sizes="100vw"
          className="object-contain"
        />
      </div>

      {/* CLOSE */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white text-2xl"
      >
        ✕
      </button>

      {/* LEFT */}
      {total > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            prev();
          }}
          className="absolute left-5 text-white text-3xl"
        >
          ‹
        </button>
      )}

      {/* RIGHT */}
      {total > 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            next();
          }}
          className="absolute right-5 text-white text-3xl"
        >
          ›
        </button>
      )}
    </div>
  );
}