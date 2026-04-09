"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import WatchMovieCard from "./WatchMovieCard";
import type { OPhimMovie } from "@/lib/watch/types";

type Props = {
  title: string;
  highlight: string;
  type: string;
  slug: string;
  api: string;
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

/**
 * Client memory cache:
 * - key: api
 * - value: movies
 */
const sectionMoviesCache = new Map<string, OPhimMovie[]>();

/**
 * Track requested sections to avoid duplicate simultaneous fetches
 */
const sectionPendingCache = new Set<string>();

export default function WatchSectionSlider({
  title,
  highlight,
  type,
  slug,
  api,
}: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [shouldLoad, setShouldLoad] = useState(() =>
    type === "the-loai" && slug === "hanh-dong"
  );
  const [movies, setMovies] = useState<OPhimMovie[]>(() => {
    return sectionMoviesCache.get(api) ?? [];
  });
  const [loaded, setLoaded] = useState(() => sectionMoviesCache.has(api));
  const [isEmpty, setIsEmpty] = useState(false);

  useEffect(() => {
    if (sectionMoviesCache.has(api)) return;

    const el = sectionRef.current;
    if (!el || loaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "100px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(el);

    return () => observer.disconnect();
  }, [api, loaded]);

  useEffect(() => {
    if (!shouldLoad || loaded) return;

    // nếu đã có cache thì dùng luôn, không fetch nữa
    const cachedMovies = sectionMoviesCache.get(api);
    if (cachedMovies) {
      setMovies(cachedMovies);
      setLoaded(true);
      setIsEmpty(cachedMovies.length === 0);
      return;
    }

    // tránh nhiều request cùng lúc cho cùng 1 section
    if (sectionPendingCache.has(api)) return;

    const controller = new AbortController();
    let cancelled = false;
    let delayTimer: NodeJS.Timeout | null = null;

    const fetchMovies = async () => {
      try {
        sectionPendingCache.add(api);

        const res = await fetch(
          `/api/watch/section?api=${encodeURIComponent(api)}`,
          {
            method: "GET",
            cache: "force-cache",
            signal: controller.signal,
          }
        );

        if (!res.ok) {
          throw new Error(`Section fetch failed: ${res.status}`);
        }

        const data = await res.json();
        const nextMovies = Array.isArray(data?.movies) ? data.movies : [];

        if (cancelled) return;

        sectionMoviesCache.set(api, nextMovies);
        setMovies(nextMovies);
        setIsEmpty(nextMovies.length === 0);
      } catch (error: any) {
        if (error?.name !== "AbortError") {
          console.error("[WatchSectionSlider] fetch error:", {
            title,
            api,
            error,
          });
          setMovies([]);
          setIsEmpty(true);
        }
      } finally {
        sectionPendingCache.delete(api);

        if (!cancelled) {
          setLoaded(true);
        }
      }
    };

    // skeleton hiện ngay, delay 1s rồi mới fetch
    delayTimer = setTimeout(() => {
      fetchMovies();
    }, 1000);

    return () => {
      cancelled = true;
      controller.abort();
      if (delayTimer) clearTimeout(delayTimer);
    };
  }, [api, shouldLoad, loaded, title]);

  const scrollByAmount = (dir: "left" | "right") => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({
      left: dir === "left" ? -920 : 920,
      behavior: "smooth",
    });
  };

  const highlightGradient = getGradientClass(highlight);

  return (
    <section ref={sectionRef} className="space-y-5">
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
          Xem tất cả <i className="fa-duotone fa-arrow-right ml-1" />
        </Link>
      </div>

      <div className="relative">
        {movies.length > 0 && (
          <>
            <button
              onClick={() => scrollByAmount("left")}
              className="absolute left-[-28px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#111827]/90 text-white shadow-[0_10px_25px_rgba(0,0,0,.4)] transition hover:scale-105 active:scale-95 lg:flex"
              aria-label="Scroll left"
            >
              <i className="fa-duotone fa-arrow-left" />
            </button>

            <button
              onClick={() => scrollByAmount("right")}
              className="absolute right-[-28px] top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-[#111827]/90 text-white shadow-[0_10px_25px_rgba(0,0,0,.4)] transition hover:scale-105 active:scale-95 lg:flex"
              aria-label="Scroll right"
            >
              <i className="fa-duotone fa-arrow-right" />
            </button>
          </>
        )}

        <div
          ref={trackRef}
          className="flex snap-x gap-2 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
        >
          {!loaded ? (
            Array.from({ length: 9 }).map((_, index) => (
              <div
                key={index}
                className="shrink-0 space-y-3 w-[123px] sm:w-[168px] lg:w-[184px]"
              >
                <div className="aspect-[2/3] w-full animate-pulse rounded-2xl bg-white/8" />
                <div className="h-4 w-4/5 animate-pulse rounded-full bg-white/8 mx-auto" />
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/6 mx-auto" />
              </div>
            ))
          ) : movies.length > 0 ? (
            movies.map((movie) => (
              <WatchMovieCard key={movie.slug} movie={movie} />
            ))
          ) : isEmpty ? (
            <div className="flex min-h-[120px] items-center text-sm text-slate-500">
              Không có dữ liệu để hiển thị.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}