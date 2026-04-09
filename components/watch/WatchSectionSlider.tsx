"use client";

import { useRef } from "react";
import Link from "next/link";
import WatchMovieCard from "./WatchMovieCard";
import type { OPhimMovie } from "@/lib/watch/types";

type Props = {
  title: string;
  highlight: string;
  type: string;
  slug: string;
  movies: OPhimMovie[];
};

const genreGradientMap: Record<string, string> = {
  // Romance / Drama
  "tình cảm": "from-rose-300 via-pink-300 to-fuchsia-400",
  "chính kịch": "from-rose-200 via-orange-200 to-amber-300",
  "gia đình": "from-amber-200 via-orange-200 to-rose-300",

  // Action / Adventure / War
  "hành động": "from-orange-300 via-red-400 to-rose-500",
  "phiêu lưu": "from-amber-200 via-orange-300 to-red-400",
  "chiến tranh": "from-stone-300 via-orange-300 to-red-500",
  "võ thuật": "from-red-300 via-orange-300 to-amber-300",

  // Horror / Thriller / Mystery / Crime
  "kinh dị": "from-fuchsia-400 via-rose-500 to-red-500",
  "giật gân": "from-violet-300 via-fuchsia-400 to-rose-500",
  "bí ẩn": "from-indigo-300 via-violet-400 to-fuchsia-400",
  "hình sự": "from-slate-300 via-zinc-300 to-red-400",
  "tội phạm": "from-zinc-300 via-stone-300 to-rose-400",

  // Sci-fi / Fantasy / Supernatural
  "viễn tưởng": "from-cyan-300 via-sky-300 to-indigo-400",
  "khoa học viễn tưởng": "from-cyan-300 via-sky-300 to-indigo-400",
  "thần thoại": "from-violet-300 via-purple-400 to-indigo-400",
  "giả tưởng": "from-fuchsia-300 via-violet-400 to-indigo-400",
  "siêu nhiên": "from-cyan-300 via-violet-300 to-fuchsia-400",

  // Animation / Comedy / Music
  "hoạt hình": "from-lime-200 via-emerald-300 to-sky-300",
  "hài": "from-yellow-200 via-amber-300 to-orange-300",
  "âm nhạc": "from-pink-300 via-fuchsia-300 to-violet-400",

  // History / Documentary / Biography
  "lịch sử": "from-amber-200 via-yellow-200 to-orange-300",
  "tài liệu": "from-sky-200 via-cyan-200 to-teal-300",
  "tiểu sử": "from-stone-200 via-amber-200 to-orange-300",

  // Youth / School / Sports
  "học đường": "from-sky-200 via-blue-300 to-indigo-300",
  "thanh xuân": "from-pink-200 via-rose-300 to-orange-200",
  "thể thao": "from-emerald-300 via-teal-300 to-cyan-400",

  // Detective / Psychological
  "tâm lý": "from-violet-300 via-purple-400 to-pink-400",
  "trinh thám": "from-slate-300 via-indigo-300 to-violet-400",
};

const fallbackGradients = [
  "from-rose-300 via-fuchsia-400 to-violet-400",
  "from-sky-300 via-cyan-300 to-indigo-400",
  "from-amber-200 via-orange-300 to-rose-400",
  "from-emerald-300 via-teal-300 to-cyan-400",
  "from-violet-300 via-purple-400 to-pink-400",
  "from-blue-300 via-indigo-300 to-violet-400",
  "from-yellow-200 via-amber-300 to-orange-400",
  "from-cyan-300 via-sky-300 to-blue-400",
];

function normalizeGenre(value: string) {
  return value.trim().toLowerCase();
}

function getGradientClass(highlight: string) {
  const normalized = normalizeGenre(highlight);

  if (genreGradientMap[normalized]) {
    return genreGradientMap[normalized];
  }

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = normalized.charCodeAt(i) + ((hash << 5) - hash);
  }

  const index = Math.abs(hash) % fallbackGradients.length;
  return fallbackGradients[index];
}

export default function WatchSectionSlider({
  title,
  highlight,
  type,
  slug,
  movies,
}: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  const scrollByAmount = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -920 : 920,
      behavior: "smooth",
    });
  };

  if (!movies?.length) return null;

  const highlightGradient = getGradientClass(highlight);

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-normal tracking-tight text-white md:text-[24px]">
          {title}{" "}
          <span className="relative inline-flex">
            {/* Soft glow layer */}
            <span
              aria-hidden="true"
              className={[
                "pointer-events-none absolute inset-0 translate-y-[1px] blur-md opacity-35",
                "bg-gradient-to-r bg-clip-text text-transparent",
                highlightGradient,
              ].join(" ")}
            >
              {highlight}
            </span>

            {/* Main gradient text */}
            <span
              className={[
                "relative inline-block font-bold tracking-tight text-transparent",
                "bg-gradient-to-r bg-clip-text",
                "drop-shadow-[0_2px_12px_rgba(255,255,255,0.08)]",
                "selection:bg-white/20",
                highlightGradient,
              ].join(" ")}
            >
              {highlight}
            </span>

            {/* Tiny underline glow */}
            <span
              aria-hidden="true"
              className={[
                "pointer-events-none absolute -bottom-[2px] left-1/2 h-[6px] w-[72%] -translate-x-1/2 rounded-full blur-md opacity-35",
                "bg-gradient-to-r",
                highlightGradient,
              ].join(" ")}
            />
          </span>
        </h2>

        <Link
          href={`/watch/browse/${type}/${slug}`}
          className="text-[15px] font-medium text-slate-400 hover:text-white/75 active:scale-95"
        >
          Xem toàn bộ <i className="fa-duotone fa-arrow-right ml-1" />
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollByAmount("left")}
          className="absolute active:scale-95 cursor-pointer left-[-28px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#111827]/90 text-white shadow-[0_10px_25px_rgba(0,0,0,.4)] transition hover:scale-105 lg:flex"
          aria-label="Scroll left"
        >
          <i className="fa-duotone fa-arrow-left" />
        </button>

        <div
          ref={trackRef}
          className="flex snap-x gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        >
          {movies.map((movie) => (
            <WatchMovieCard key={movie.slug} movie={movie} />
          ))}
        </div>

        <button
          onClick={() => scrollByAmount("right")}
          className="absolute active:scale-95 cursor-pointer right-[-28px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#111827]/90 text-white shadow-[0_10px_25px_rgba(0,0,0,.4)] transition hover:scale-105 lg:flex"
          aria-label="Scroll right"
        >
          <i className="fa-duotone fa-arrow-right" />
        </button>
      </div>
    </section>
  );
}