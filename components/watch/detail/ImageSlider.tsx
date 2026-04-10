"use client";

import { useEffect, useRef, useState } from "react";

type ImageItem = {
  file_path: string;
  type: string;
};

type Props = {
  slug: string;
};

export default function ImageSlider({ slug }: Props) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [baseUrl, setBaseUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const sliderRef = useRef<HTMLDivElement>(null);

  const [canScroll, setCanScroll] = useState(false);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const checkScroll = () => {
    const el = sliderRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;

    setCanScroll(scrollWidth > clientWidth + 10);
    setIsStart(scrollLeft <= 10);
    setIsEnd(scrollLeft + clientWidth >= scrollWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    if (!sliderRef.current) return;

    sliderRef.current.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const fetchImages = async () => {
      const res = await fetch(
        `https://ophim1.com/v1/api/phim/${slug}/images`
      );
      const data = await res.json();

      setImages(data?.data?.images || []);
      setBaseUrl(data?.data?.image_sizes?.backdrop?.w780 || "");
      setLoading(false);
    };

    fetchImages();
  }, [slug]);

  useEffect(() => {
    checkScroll();

    const el = sliderRef.current;
    if (!el) return;

    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [images]);

  if (loading) return null;
  if (!images.length) return null;

  const group = `watch-images-${slug}`;

  return (
    <div className="relative border border-white/10 bg-white/5 rounded-2xl p-5 backdrop-blur-lg">
      <h2 className="mb-4 text-lg font-semibold text-white/90">
        Hình ảnh
      </h2>

      {canScroll && !isStart && (
        <button
          onClick={() => scroll("left")}
          className="opacity-0 sm:opacity-100 cursor-pointer absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 hover:bg-black active:scale-95"
        >
          <i className="fa-duotone fa-arrow-left text-white" />
        </button>
      )}

      {canScroll && !isEnd && (
        <button
          onClick={() => scroll("right")}
          className="opacity-0 sm:opacity-100 cursor-pointer absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/60 p-2 hover:bg-black active:scale-95"
        >
          <i className="fa-duotone fa-arrow-right text-white" />
        </button>
      )}

      <div
        ref={sliderRef}
        className="flex gap-3 overflow-x-auto scrollbar-none scroll-smooth"
      >
        {images.map((img, index) => (
          <div
            key={index}
            className="min-w-[120px] max-w-[120px] overflow-hidden rounded-xl"
          >
            <a
              data-fancybox={group}
              href={`${baseUrl}${img.file_path}`}
            >
              <img
                src={`${baseUrl}${img.file_path}`}
                className="aspect-[3/4] w-full object-cover transition hover:scale-105"
                loading="lazy"
              />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}