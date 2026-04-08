"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { stripHtml } from "@/lib/watch/ophim";
import type { OPhimMovie } from "@/lib/watch/types";

type HeroMovie = OPhimMovie & {
  _bgUrl: string;
  _thumbUrl: string;
};

type Props = {
  movies: HeroMovie[];
};

const SLIDE_MS = 7000;

export default function WatchHero({ movies }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const active = movies[activeIndex];

  useEffect(() => {
    if (!movies?.length || paused) return;
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % movies.length);
    }, SLIDE_MS);

    return () => clearInterval(id);
  }, [movies, paused]);

  const desc = useMemo(() => {
    if (!active?.content) return "";
    return stripHtml(active.content).slice(0, 260);
  }, [active]);

  if (!movies?.length || !active) return null;

  const score = active.imdb?.vote_average || active.tmdb?.vote_average || "";
  const country = active.country?.map((c) => c.name).join(" · ");
  const genres = active.category ?? [];

  return (
    <section
      className="relative h-screen min-h-[860px] w-full overflow-hidden bg-[#030712]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Progress bar */}
      
      {/* BG layers */}
      <div className="absolute inset-0">
        <Image
          src={active._bgUrl}
          alt={active.name}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/15" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/72 to-[#020617]/18" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/18 to-transparent" />
      </div>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] items-end px-5 pb-10 pt-28 md:px-8 xl:px-12">
        <div className="grid h-full w-full grid-cols-1 lg:grid-cols-[minmax(0,1fr)_230px] lg:gap-8">
          {/* Main content */}
          <div className="flex h-full flex-col justify-center">
            <div className="max-w-4xl">
              <div className="inline-flex rounded-full bg-white/10 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55 backdrop-blur">
                Phim mới cập nhật
              </div>

              <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                {active.name}
              </h1>

              {active.origin_name && (
                <p className="mt-3 text-lg text-slate-300 md:text-[22px]">
                  {active.origin_name}
                </p>
              )}

              {/* Badges */}
              <div className="mt-5 flex flex-wrap gap-2.5">
                {score ? (
                  <span className="rounded-full bg-amber-400/20 px-3 py-1.5 text-sm font-semibold text-amber-300">
                    IMDb {score}
                  </span>
                ) : null}

                {active.episode_current ? (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/90">
                    {active.episode_current}
                  </span>
                ) : null}

                {active.quality ? (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/90">
                    {active.quality}
                  </span>
                ) : null}

                {active.lang ? (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/90">
                    {active.lang}
                  </span>
                ) : null}

                {active.year ? (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/90">
                    {active.year}
                  </span>
                ) : null}

                {country ? (
                  <span className="rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-white/90">
                    {country}
                  </span>
                ) : null}
              </div>

              {/* Genre chips */}
              {genres.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2.5">
                  {genres.slice(0, 5).map((genre) => (
                    <Link
                      key={genre.slug}
                      href={`/watch/browse/the-loai/${genre.slug}`}
                      className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-sm font-medium text-white/80 backdrop-blur transition hover:bg-white/10 hover:text-white"
                    >
                      {genre.name}
                    </Link>
                  ))}
                </div>
              )}

              {/* Desc */}
              {desc && (
                <p className="mt-6 max-w-3xl text-[15px] leading-8 text-slate-300 md:text-[16px]">
                  {desc}
                  {stripHtml(active.content || "").length > 260 ? "..." : ""}
                </p>
              )}

              {/* CTA */}
              <div className="mt-8">
                <Link
                  href={`/watch/${active.slug}`}
                  className="inline-flex items-center gap-3 rounded-full bg-white px-7 py-3.5 text-sm font-extrabold text-black shadow-[0_10px_30px_rgba(255,255,255,.15)] transition hover:scale-[1.02]"
                >
                  ▶ Xem phim
                </Link>
              </div>
            </div>
          </div>

          {/* Thumb rail desktop */}
          <div className="hidden h-full items-center justify-center lg:flex">
            <div className="flex max-h-[72vh] w-full flex-col gap-3 overflow-y-auto pr-1 scrollbar-hide">
              {movies.map((movie, index) => (
                <button
                  key={movie.slug}
                  onClick={() => setActiveIndex(index)}
                  className={`group flex items-center gap-3 rounded-[18px] border p-2 text-left backdrop-blur transition ${
                    activeIndex === index
                      ? "border-white/15 bg-white/10"
                      : "border-white/8 bg-black/25 hover:bg-white/7"
                  }`}
                >
                  <div className="relative h-[88px] w-[62px] shrink-0 overflow-hidden rounded-[14px]">
                    <Image
                      src={movie._thumbUrl}
                      alt={movie.name}
                      fill
                      className="object-cover"
                      sizes="62px"
                    />
                  </div>

                  <div className="min-w-0">
                    <p className="line-clamp-2 text-[14px] font-extrabold leading-snug text-white">
                      {movie.name}
                    </p>
                    <p className="mt-1 line-clamp-1 text-[12px] text-slate-400">
                      {movie.origin_name || ""}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dots */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 lg:hidden">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`h-2.5 rounded-full transition-all ${
              activeIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/35"
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}