"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  images: string[];
  index: number;
  isOpen: boolean;
  onClose: () => void;
  setIndex: (i: number) => void;
};

export default function ImagePreview({
  images,
  index,
  isOpen,
  onClose,
  setIndex,
}: Props) {
  const [mounted, setMounted] = useState(false);
  const total = images.length;

  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 CHỈ lock scroll khi mở
  useEffect(() => {
    if (!isOpen) return;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };

    window.addEventListener("keydown", handleKey);

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, index]);

  const prev = () => setIndex((index - 1 + total) % total);
  const next = () => setIndex((index + 1) % total);

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl px-4"
        style={{ height: "90vh" }}
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

      {/* NAV */}
      {total > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-5 top-1/2 -translate-y-1/2 text-white text-4xl"
          >
            ‹
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-5 top-1/2 -translate-y-1/2 text-white text-4xl"
          >
            ›
          </button>
        </>
      )}
    </div>,
    document.body
  );
}