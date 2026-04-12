"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type WatchDetailHeroProps = {
  movie: {
    name: string;
    origin_name?: string;
    slug: string;
    thumb_url?: string;
    poster_url?: string;
    quality?: string;
    lang?: string;
    year?: number | string;
    episode_current?: string;
    category?: { name: string; slug: string }[];
    country?: { name: string; slug: string }[];
  };
  compact?: boolean;
};

export default function WatchDetailHero({
  movie,
  compact = false,
}: WatchDetailHeroProps) {
  const backdrop = movie.poster_url || movie.thumb_url || "";
  const poster = movie.thumb_url || movie.poster_url || "";
  const watchHref = `/watch/${movie.slug}?server=1&ep=1`;
  const [loaded, setLoaded] = useState(false);
  return (
    <section
      className={[
        "relative overflow-hidden",
        compact ? "min-h-[40vh]" : "min-h-screen",
      ].join(" ")}
    >
      <div className="fixed inset-0 pointer-events-none">
        {/* Skeleton */}
        {!loaded && (
          <div className="absolute inset-0 animate-pulse bg-neutral-800" />
        )}

        <Image
          src={backdrop}
          alt={movie.name}
          fill
          priority
          sizes="100vw"
          quality={75}
          onLoad={() => setLoaded(true)}
          className={`object-cover object-center transition duration-700
      ${loaded ? "opacity-20" : "opacity-0"}`}
        />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-12 pt-50 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="relative mx-auto aspect-[2/3] w-[280px] overflow-hidden rounded-3xl shadow-3xl shadow-black/40 sm:w-[280px] lg:mx-0 lg:w-[400px]">
          {!loaded && (
            <div className="absolute inset-0 animate-pulse bg-white/10" />
          )}

          <Image
            src={poster}
            alt={movie.name}
            fill
            sizes="(max-width: 640px) 280px,
         (max-width: 1024px) 280px,
         400px"
            className="object-cover pointer-events-none"
          />
        </div>

        <div className="max-w-4xl flex-1">
          {/* KHỐI 1: TÊN PHIM */}
          <div className="text-center lg:text-left">
            <h1 className="font-black tracking-tight text-white text-3xl lg:text-5xl">
              {movie.name}
            </h1>

            {movie.origin_name ? (
              <p className="mt-3 text-white/60 text-base lg:text-xl">
                {movie.origin_name}
              </p>
            ) : null}
          </div>

          {/* KHỐI 2: TOÀN BỘ BADGES */}
          <div className="mt-8 flex flex-wrap gap-2 justify-center lg:justify-start">
            {movie.quality ? (
              <span className="rounded-full border border-emerald-300/40 bg-emerald-400/20 px-4 py-2 text-sm font-semibold text-emerald-200 shadow-[0_0_24px_rgba(52,211,153,0.28)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.05] hover:bg-emerald-400/25">
                {movie.quality}
              </span>
            ) : null}

            {movie.lang ? (
              <span className="rounded-full border border-fuchsia-300/40 bg-fuchsia-400/20 px-4 py-2 text-sm font-semibold text-fuchsia-200 shadow-[0_0_24px_rgba(232,121,249,0.28)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.05] hover:bg-fuchsia-400/25">
                {movie.lang}
              </span>
            ) : null}

            {movie.year ? (
              <span className="rounded-full border border-violet-300/40 bg-violet-400/20 px-4 py-2 text-sm font-semibold text-violet-200 shadow-[0_0_24px_rgba(167,139,250,0.28)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.05] hover:bg-violet-400/25">
                {movie.year}
              </span>
            ) : null}

            {movie.episode_current ? (
              <span className="rounded-full border border-sky-300/40 bg-sky-400/20 px-4 py-2 text-sm font-semibold text-sky-200 shadow-[0_0_24px_rgba(56,189,248,0.28)] backdrop-blur-xl transition-all duration-300 hover:scale-[1.05] hover:bg-sky-400/25">
                {movie.episode_current}
              </span>
            ) : null}

            {movie.category?.map((item, index) => {
              const categoryColors = [
                "border-rose-300/40 bg-rose-400/20 text-rose-200 shadow-[0_0_24px_rgba(251,113,133,0.28)] hover:bg-rose-400/25",
                "border-cyan-300/40 bg-cyan-400/20 text-cyan-200 shadow-[0_0_24px_rgba(34,211,238,0.28)] hover:bg-cyan-400/25",
                "border-amber-300/40 bg-amber-400/20 text-amber-200 shadow-[0_0_24px_rgba(251,191,36,0.28)] hover:bg-amber-400/25",
                "border-lime-300/40 bg-lime-400/20 text-lime-200 shadow-[0_0_24px_rgba(163,230,53,0.28)] hover:bg-lime-400/25",
                "border-pink-300/40 bg-pink-400/20 text-pink-200 shadow-[0_0_24px_rgba(244,114,182,0.28)] hover:bg-pink-400/25",
                "border-indigo-300/40 bg-indigo-400/20 text-indigo-200 shadow-[0_0_24px_rgba(129,140,248,0.28)] hover:bg-indigo-400/25",
              ];

              return (
                <span
                  key={`cat-${item.slug}`}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-[1.05] ${categoryColors[index % categoryColors.length]}`}
                >
                  {item.name}
                </span>
              );
            })}

            {movie.country?.map((item, index) => {
              const countryColors = [
                "border-teal-300/40 bg-teal-400/20 text-teal-200 shadow-[0_0_24px_rgba(45,212,191,0.28)] hover:bg-teal-400/25",
                "border-orange-300/40 bg-orange-400/20 text-orange-200 shadow-[0_0_24px_rgba(251,146,60,0.28)] hover:bg-orange-400/25",
                "border-purple-300/40 bg-purple-400/20 text-purple-200 shadow-[0_0_24px_rgba(192,132,252,0.28)] hover:bg-purple-400/25",
                "border-blue-300/40 bg-blue-400/20 text-blue-200 shadow-[0_0_24px_rgba(96,165,250,0.28)] hover:bg-blue-400/25",
                "border-red-300/40 bg-red-400/20 text-red-200 shadow-[0_0_24px_rgba(248,113,113,0.28)] hover:bg-red-400/25",
                "border-yellow-300/40 bg-yellow-400/20 text-yellow-200 shadow-[0_0_24px_rgba(250,204,21,0.28)] hover:bg-yellow-400/25",
              ];

              return (
                <span
                  key={`country-${item.slug}`}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold backdrop-blur-xl transition-all duration-300 hover:scale-[1.05] ${countryColors[index % countryColors.length]}`}
                >
                  {item.name}
                </span>
              );
            })}
          </div>

          {/* KHỐI 3: CTA */}
          <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
            <Link
              href="/watch"
              className="
    inline-flex h-12 items-center justify-center gap-2
    rounded-full border border-white/20
    bg-white/90 px-8 lg:px-12
    text-sm lg:text-base font-semibold text-white
    backdrop-blur-xl
    shadow-[0_12px_30px_rgba(255,255,255,0.08)]
    transition-all duration-300
    hover:-translate-y-0.5 hover:scale-[1.02] hover:bg-white/100
    hover:shadow-[0_16px_40px_rgba(255,255,255,0.14)]
    active:translate-y-0 active:scale-[0.97]
    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black
  "
            >
              <i className="fa-duotone fa-arrow-left text-sm text-black" />
              <span className="text-black">Quay lại</span>
            </Link>

            <Link
              href={watchHref}
              className="
      inline-flex h-12 items-center justify-center gap-2
      rounded-full border border-red-400/30
      bg-red-600
      px-8 lg:px-12
      text-sm lg:text-base font-semibold text-white
      shadow-[0_12px_30px_rgba(239,68,68,0.28)]
      transition-all duration-300
      hover:-translate-y-0.5 hover:scale-[1.02]
      hover:from-red-400 hover:via-red-500 hover:to-red-500
      hover:shadow-[0_16px_42px_rgba(239,68,68,0.38)]
      active:translate-y-0 active:scale-[0.97]
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-black
    "
            >
              <i className="fa-duotone fa-play text-sm" />
              <span>Xem phim</span>
            </Link>
          </div>      </div>
      </div>
    </section>
  );
}