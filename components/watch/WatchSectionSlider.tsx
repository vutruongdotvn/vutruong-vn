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

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[22px] font-bold tracking-tight text-white md:text-[24px]">
          {title}{" "}
          <span className="font-extrabold text-orange-500">{highlight}</span>
        </h2>

        <Link
          href={`/watch/browse/${type}/${slug}`}
          className="text-[15px] font-medium text-slate-400 transition hover:text-white"
        >
          Xem toàn bộ <span className="ml-1">→</span>
        </Link>
      </div>

      <div className="relative">
        <button
          onClick={() => scrollByAmount("left")}
          className="absolute left-[-18px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#111827]/90 text-white shadow-[0_10px_25px_rgba(0,0,0,.4)] transition hover:scale-105 lg:flex"
          aria-label="Scroll left"
        >
          ←
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
          className="absolute right-[-18px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-[#111827]/90 text-white shadow-[0_10px_25px_rgba(0,0,0,.4)] transition hover:scale-105 lg:flex"
          aria-label="Scroll right"
        >
          →
        </button>
      </div>
    </section>
  );
}