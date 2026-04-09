"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
const SWIPE_THRESHOLD = 50;

export default function WatchHero({ movies }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);
  const [contentKey, setContentKey] = useState(0);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const active = movies[activeIndex];

  const clearSlideTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const restartAutoplay = () => {
    clearSlideTimeout();
    setProgressKey((prev) => prev + 1);

    timeoutRef.current = setTimeout(() => {
      setActiveIndex((prev) => (prev + 1) % movies.length);
    }, SLIDE_MS);
  };

  useEffect(() => {
    if (!movies?.length) return;
    restartAutoplay();
    setContentKey((prev) => prev + 1);

    return () => clearSlideTimeout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, movies.length]);

  const desc = useMemo(() => {
    if (!active?.content) return "";
    return stripHtml(active.content).slice(0, 180);
  }, [active]);

  if (!movies?.length || !active) return null;

  const score = active.imdb?.vote_average || active.tmdb?.vote_average || "";
  const country = active.country?.map((c) => c.name).join(" · ");
  const genres = active.category ?? [];

  const goToSlide = (index: number) => {
    if (index === activeIndex) {
      restartAutoplay();
      return;
    }
    setActiveIndex(index);
  };

  const goPrev = () => {
    setActiveIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const goNext = () => {
    setActiveIndex((prev) => (prev + 1) % movies.length);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLElement>) => {
    touchStartX.current = e.changedTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLElement>) => {
    touchEndX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const deltaX = touchStartX.current - touchEndX.current;

    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
      if (deltaX > 0) {
        goNext();
      } else {
        goPrev();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  return (
    <section
      className="relative h-screen min-h-[860px] w-full overflow-hidden bg-[#030712]"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Progress bar */}
      <div className="absolute inset-x-0 top-0 z-30 h-[3px] bg-white/8">
        <div
          key={`${active.slug}-${progressKey}`}
          className="h-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-400"
          style={{
            animation: `heroProgress ${SLIDE_MS}ms linear forwards`,
          }}
        />
      </div>

      {/* BG layers */}
      <div className="absolute inset-0">
        <div
          key={active.slug}
          className="absolute inset-0 scale-[1.035] animate-[heroBgReveal_2000ms_ease-in-out_forwards] aspect-video"
        >
          <Image
            src={active._bgUrl}
            alt={active.name}
            fill
            priority
            unoptimized
            className="object-cover"
            sizes="1600px object-cover object-center"
          />
        </div>

        <div className="absolute inset-x-0 bottom-0 h-screen bg-gradient-to-t from-[#030b1f] via-[#030b1f]/70 to-[#030b1f]/20" />
      </div>

      {/* Nav arrows */}
      <button
        onClick={goPrev}
        aria-label="Previous slide"
        className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/85 backdrop-blur-md transition hover:scale-105 hover:bg-white/10 active:scale-95 cursor-pointer lg:flex md:left-6"
      >
        <i className="fa-duotone fa-arrow-left text-base" />
      </button>

      <button
        onClick={goNext}
        aria-label="Next slide"
        className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/35 text-white/85 backdrop-blur-md transition hover:scale-105 hover:bg-white/10 active:scale-95 cursor-pointer lg:flex md:right-6"
      >
        <i className="fa-duotone fa-arrow-right text-base" />
      </button>

      <div className="relative z-10 mx-auto flex h-full w-full max-w-[1600px] px-5 pb-8 pt-28 md:px-8 xl:px-12">
        <div className="flex h-full w-full flex-col">
          {/* Main centered content */}
          <div className="flex flex-1 items-center justify-center">
            <div
              key={`${active.slug}-${contentKey}`}
              className="mx-auto flex w-full max-w-5xl animate-[heroContentIn_700ms_cubic-bezier(0.22,1,0.36,1)_forwards] flex-col items-center text-center opacity-0"
            >
              <div className="rounded-full border border-white/10 bg-white/6 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/55 backdrop-blur">
                Phim mới cập nhật
              </div>

              <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white drop-shadow-[0_10px_35px_rgba(0,0,0,.45)] sm:text-5xl md:text-6xl">
                {active.name}
              </h1>

              {active.origin_name && (
                <p className="mt-3 text-base text-slate-300 md:text-[22px]">
                  {active.origin_name}
                </p>
              )}

              {/* Badges */}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
                {score ? (
                  <span className="rounded-full border border-amber-300/30 bg-amber-400/15 px-3 py-1.5 text-sm font-semibold text-amber-200 shadow-[0_8px_30px_rgba(251,191,36,0.18)] backdrop-blur-md">
                    IMDb {score}
                  </span>
                ) : null}

                {active.episode_current ? (
                  <span className="rounded-full border border-emerald-300/30 bg-emerald-400/15 px-3 py-1.5 text-sm font-semibold text-emerald-200 shadow-[0_8px_30px_rgba(52,211,153,0.18)] backdrop-blur-md">
                    {active.episode_current}
                  </span>
                ) : null}

                {active.quality ? (
                  <span className="rounded-full border border-sky-300/30 bg-sky-400/15 px-3 py-1.5 text-sm font-semibold text-sky-200 shadow-[0_8px_30px_rgba(56,189,248,0.18)] backdrop-blur-md">
                    {active.quality}
                  </span>
                ) : null}

                {active.lang ? (
                  <span className="rounded-full border border-cyan-300/30 bg-cyan-400/15 px-3 py-1.5 text-sm font-semibold text-cyan-200 shadow-[0_8px_30px_rgba(34,211,238,0.18)] backdrop-blur-md">
                    {active.lang}
                  </span>
                ) : null}

                {active.year ? (
                  <span className="rounded-full border border-violet-300/30 bg-violet-400/15 px-3 py-1.5 text-sm font-semibold text-violet-200 shadow-[0_8px_30px_rgba(167,139,250,0.18)] backdrop-blur-md">
                    {active.year}
                  </span>
                ) : null}

                {country ? (
                  <span className="rounded-full border border-rose-300/30 bg-rose-400/15 px-3 py-1.5 text-sm font-semibold text-rose-200 shadow-[0_8px_30px_rgba(251,113,133,0.18)] backdrop-blur-md">
                    {country}
                  </span>
                ) : null}
              </div>

              {/* Genre chips */}
              {genres.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
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
                  className="inline-flex items-center gap-3 rounded-full bg-red-500 px-8 py-3.5 text-base font-semibold text-white shadow-[0_14px_40px_rgba(239,68,68,.35)] transition hover:scale-[1.02] hover:bg-red-400 active:scale-95"
                >
                  <i className="fa-duotone fa-play" /> Xem phim
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom thumb rail desktop/tablet */}
          <div className="relative z-10 hidden lg:block">
            <div className="mx-auto w-full max-w-[800px]">
              <div className="grid grid-cols-10 gap-2">
                {movies.slice(0, 10).map((movie, index) => {
                  const isActive = activeIndex === index;

                  return (
                    <button
                      key={movie.slug}
                      onClick={() => goToSlide(index)}
                      className={`cursor-pointer group relative overflow-hidden rounded-lg border transition-all duration-300 active:scale-95 ${isActive
                          ? "translate-y-[-6px] border-white/25 ring-2 ring-white/50 shadow-[0_18px_40px_rgba(0,0,0,.35)]"
                          : "border-white/10 opacity-80 hover:-translate-y-1 hover:opacity-100"
                        }`}
                    >
                      <div className="relative aspect-[2/3] w-full overflow-hidden bg-white/5">
                        <Image
                          src={movie._thumbUrl}
                          alt={movie.name}
                          fill
                          unoptimized
                          className={`object-cover transition duration-500 ${isActive ? "scale-[1.03]" : "scale-100 group-hover:scale-105"
                            }`}
                        />

                        <div
                          className={`absolute inset-0 transition duration-300 ${isActive
                              ? "bg-gradient-to-t from-black/10 via-transparent to-transparent"
                              : "bg-black/35 group-hover:bg-black/18"
                            }`}
                        />

                        {isActive && (
                          <>
                            <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/10">
                              <div
                                key={`thumb-progress-${active.slug}-${progressKey}`}
                                className="h-full bg-gradient-to-r from-red-500 via-rose-500 to-orange-400"
                                style={{
                                  animation: `heroProgress ${SLIDE_MS}ms linear forwards`,
                                }}
                              />
                            </div>

                            <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
                          </>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile dots */}
      <div className="absolute bottom-5 left-1/2 z-20 flex -translate-x-1/2 gap-2 lg:hidden">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2.5 rounded-full transition-all ${activeIndex === index ? "w-8 bg-white" : "w-2.5 bg-white/35"
              }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes heroProgress {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }

        @keyframes heroContentIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }

        @keyframes heroBgReveal {
          0% {
            opacity: 0;
            transform: scale(1.1);
            filter: blur(10px);
          }
          100% {
            opacity: 1;
            transform: scale(1);
            filter: blur(0);
          }
        }
      `}</style>
    </section>
  );
}