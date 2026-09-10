"use client";

import { useQueries } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { A11y, EffectFade } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperInstance } from "swiper";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";
import WatchRemoteImage from "@/components/watch/WatchRemoteImage";
import { selectWatchHeroSlugs, WATCH_HERO_SLUGS } from "@/lib/watch/watchHeroConfig";
import { watchMovieHref } from "@/lib/watch/watchRoutes";
import {
  WatchApiError,
  watchApiErrorMessage,
  type WatchMovieSummary,
} from "@/types/watchApi";
import "swiper/css";
import "swiper/css/effect-fade";

const SLUGS = selectWatchHeroSlugs(WATCH_HERO_SLUGS);

const HERO_ROOT_CLASS = [
  "relative isolate w-full bg-background text-foreground",
  "[&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-ring",
  "[&_button:focus-visible]:outline-offset-4",
  "[&_button:disabled]:cursor-default [&_button:disabled]:opacity-50",
  "motion-reduce:[&_*]:duration-0! motion-reduce:[&_*]:animate-none!",
  "motion-reduce:[&_*]:scroll-auto!",
].join(" ");

const HERO_ARTICLE_CLASS = [
  "relative box-border flex min-h-[max(45rem,100svh)] items-end",
  "overflow-hidden bg-card pt-32 pb-46",
  "max-[47.99rem]:min-h-[max(48rem,100svh)]",
  "max-[47.99rem]:pt-84 max-[47.99rem]:pb-50",
].join(" ");

const HERO_GRADIENT_CLASS = [
  "pointer-events-none absolute inset-0 size-full",
  // Đáy đậm màu 100%, kéo dày tới 15%, rồi tan nhanh và kết thúc hoàn toàn ở 35% chiều cao
  "bg-gradient-to-t from-[var(--background)] from-0% via-[var(--background)] via-15% to-transparent to-100%",
  // Responsive (< 47.99rem): Đậm ở đáy và kết thúc sớm hơn ở 40%
  "max-[47.99rem]:bg-gradient-to-t max-[47.99rem]:from-[var(--background)] max-[47.99rem]:from-0% max-[47.99rem]:via-[color-mix(in_srgb,var(--background)_90%,transparent)] max-[47.99rem]:via-20% max-[47.99rem]:to-transparent max-[47.99rem]:to-40%",
].join(" ");

const HERO_BUTTON_CLASS = [
  "inline-flex min-h-[3.15rem] cursor-pointer items-center justify-center",
  "gap-[.65rem] rounded-full border border-transparent",
  "bg-primary px-[1.4rem] py-3 text-[.9rem] font-semibold",
  "text-primary-foreground",
  "shadow-[0_8px_24px_color-mix(in_srgb,var(--foreground)_12%,transparent)]",
  "hover:opacity-90 [&_svg]:size-[1.2rem]",
].join(" ");

const HERO_NAV_BUTTON_CLASS = [
  "inline-flex size-11 shrink-0 cursor-pointer items-center justify-center",
  "rounded-full border border-border bg-card p-0",
  "text-[1.2rem] text-foreground hover:bg-accent",
  "max-[47.99rem]:size-[2.55rem]",
].join(" ");

const THUMBNAIL_BUTTON_CLASS = [
  "relative aspect-[16/10] w-[clamp(4.2rem,7vw,6.3rem)] shrink-0",
  "cursor-pointer overflow-hidden rounded-xl border-2 border-border",
  "bg-muted p-0 opacity-65",
  "transition-[opacity,border-color,transform] duration-[180ms]",
  "aria-pressed:-translate-y-[2px] aria-pressed:border-primary",
  "aria-pressed:opacity-100",
  "aria-pressed:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_18%,transparent)]",
  "hover:opacity-100",
  "max-[47.99rem]:w-[3.7rem] max-[47.99rem]:rounded-[.55rem]",
].join(" ");

const HERO_DIALOG_CLASS = [
  "m-auto max-h-[85svh] w-[min(42rem,calc(100%_-_2rem))] animate-fadeIn",
  "rounded-3xl border border-border bg-card p-0 text-foreground",
  "shadow-[0_24px_90px_color-mix(in_srgb,var(--foreground)_18%,transparent)]",
  "backdrop:bg-overlay backdrop:backdrop-blur-[5px]",
  "[&_h2]:m-0 [&_h2]:mt-4 [&_h2]:text-[1.85rem]",
  "[&_h2]:leading-[1.25] [&_h2]:text-balance",
  "max-[47.99rem]:[&_h2]:text-[1.6rem]",
].join(" ");

function heroErrorMessage(error: unknown): string {
  if (error instanceof WatchApiError) {
    if (error.code === "rate_limited") {
      return watchApiErrorMessage(error);
    }

    if (error.code === "http_error" && error.details.status === 404) {
      return "Nguồn hiện chưa có phim này. Bạn có thể chọn phim khác.";
    }
  }

  return "Chưa tải được thông tin phim. Bạn có thể thử lại hoặc chọn phim khác.";
}

function WatchHeroMovie({
  movie,
  openInfo,
}: {
  movie: WatchMovieSummary;
  openInfo: () => void;
}) {
  const movieHref = watchMovieHref(movie.slug);
  const badges = [
    movie.quality,
    movie.language,
    movie.year,
    movie.duration,
    movie.currentEpisode,
  ].filter((value): value is string => Boolean(value));
  const categories = [
    ...movie.genres.slice(0, 3),
    ...movie.countries.slice(0, 1),
  ];

  return (
    <>
      <h2
        data-watch-hero-title
        className="m-0 text-[clamp(2rem,3vw,4rem)] font-extrabold leading-[1.08] tracking-[.0015em] text-balance wrap-anywhere max-[47.99rem]:text-[clamp(2rem,8vw,3.25rem)]"
      >
        {movie.name}
      </h2>

      {movie.originalName && (
        <p className="m-0 mt-[.8rem] text-[clamp(.95rem,1.5vw,1.125rem)] leading-[1.5] text-muted-foreground max-[47.99rem]:text-[.9rem]">
          {movie.originalName}
        </p>
      )}

      <div className="mt-[1.6rem] flex flex-wrap gap-[.45rem] [&_span]:rounded-[.4rem] [&_span]:border [&_span]:border-border [&_span]:bg-card/88 [&_span]:px-[.55rem] [&_span]:py-[.3rem] [&_span]:text-xs [&_span]:font-semibold max-[47.99rem]:mt-[1.1rem] max-[47.99rem]:[&_span]:text-[.68rem]">
        {badges.map((value, index) => (
          <span key={`${index}-${value}`}>{value}</span>
        ))}
      </div>

      {categories.length > 0 && (
        <p className="mx-0 my-[.85rem] text-[.85rem] leading-[1.7] text-muted-foreground max-[47.99rem]:text-[.78rem]">
          {categories.join(" · ")}
        </p>
      )}

      {movie.description && (
        <p className="mx-0 mt-4 mb-7 line-clamp-3 max-w-[34rem] text-[.95rem] leading-[1.85] max-[47.99rem]:mb-[1.2rem] max-[47.99rem]:text-sm">
          {movie.description}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" className={HERO_BUTTON_CLASS} onClick={openInfo}>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 11v6m0-10v1" />
          </svg>
          Thông tin phim
        </button>

        {movieHref && (
          <Link
            href={movieHref}
            prefetch={false}
            className="inline-flex min-h-[3.15rem] items-center justify-center gap-[.65rem] rounded-full border border-border bg-card/88 px-[1.4rem] py-3 text-[.9rem] font-semibold text-foreground no-underline hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
          >
            Chi tiết phim
            <i className="fad fa-arrow-right" aria-hidden="true" />
          </Link>
        )}
      </div>
    </>
  );
}

function WatchHeroError({
  active,
  error,
  pending,
  retry,
}: {
  active: boolean;
  error: unknown;
  pending: boolean;
  retry: () => void;
}) {
  return (
    <div
      className="min-h-60 max-w-[30rem] [&_h2]:m-0 [&_h2]:text-[2rem] [&_h2]:leading-[1.2] [&_p]:mx-0 [&_p]:mt-4 [&_p]:mb-6 [&_p]:leading-[1.8] [&_p]:text-muted-foreground"
      role={active ? "status" : undefined}
    >
      <h2>Chưa tải được phim này</h2>
      <p>{heroErrorMessage(error)}</p>
      <button type="button" className={HERO_BUTTON_CLASS} disabled={pending} onClick={retry}>
        {pending ? "Đang tải…" : "Thử lại phim này"}
      </button>
    </div>
  );
}

function WatchHeroLoading({ active }: { active: boolean }) {
  return (
    <div
      className="min-h-68 pt-2 [&>span:not(.sr-only)]:mb-4 [&>span:not(.sr-only)]:block [&>span:not(.sr-only)]:h-11 [&>span:not(.sr-only)]:w-4/5 [&>span:not(.sr-only)]:rounded-xl [&>span:not(.sr-only)]:bg-skeleton [&>span:last-child]:mt-8 [&>span:last-child]:h-[1.3rem] [&>span:last-child]:w-[55%]"
      role={active ? "status" : undefined}
    >
      <span className="sr-only">Đang tải phim nổi bật…</span>
      <span />
      <span />
      <span />
    </div>
  );
}

/**
 * Hero dùng một danh sách slug hữu hạn trong watchHeroConfig.ts.
 * Chuyển slide chỉ đổi index, không tạo thêm query ngoài danh sách cấu hình.
 */
export default function WatchHero() {
  const scope = useWatchQueryScope();
  const queries = useQueries({
    queries: SLUGS.map(slug => ({
      ...scope.detailOptions(slug),
      enabled: scope.getSnapshot().ready,
    })),
  });

  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  const swiper = useRef<SwiperInstance | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const thumbList = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const dialogHeadingId = useId();
  const active = queries[index]?.data;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const list = thumbList.current;
    const button = list?.children[index] as HTMLButtonElement | undefined;

    if (list && button) {
      list.scrollTo({
        left: button.offsetLeft - list.offsetLeft - (list.clientWidth - button.offsetWidth) / 2,
        behavior: reducedMotion ? "instant" : "smooth",
      });
    }
  }, [index, reducedMotion]);

  function goTo(next: number) {
    if (swiper.current && !swiper.current.destroyed && SLUGS.length > 1) {
      swiper.current.slideTo((next + SLUGS.length) % SLUGS.length);
    }
  }

  if (SLUGS.length === 0) {
    return (
      <section className="min-h-[70svh] px-8 pt-40 pb-16">
        <h1>Phim nổi bật</h1>
        <p>Chưa có phim trong bộ sưu tập này.</p>
      </section>
    );
  }

  return (
    <section className={HERO_ROOT_CLASS} aria-labelledby={headingId} data-watch-hero>
      <h1 id={headingId} className="sr-only">
        Phim nổi bật trên VT Zone Watch
      </h1>

      <Swiper
        className="w-full!"
        modules={[A11y, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        slidesPerView={1}
        loop={false}
        rewind={false}
        speed={reducedMotion ? 0 : 550}
        allowTouchMove={SLUGS.length > 1}
        a11y={{
          enabled: true,
          containerRoleDescriptionMessage: "Bộ sưu tập phim nổi bật",
          itemRoleDescriptionMessage: "Phim",
          slideLabelMessage: "{{index}} trên {{slidesLength}}",
        }}
        onSwiper={(instance: SwiperInstance) => {
          swiper.current = instance;
        }}
        onSlideChange={(instance: SwiperInstance) => {
          dialog.current?.close();
          setIndex(instance.activeIndex);
        }}
      >
        {SLUGS.map((slug, position) => {
          const query = queries[position];
          const movie = query.data;
          const isActive = index === position;

          return (
            <SwiperSlide key={slug}>
              <article
                className={HERO_ARTICLE_CLASS}
                aria-hidden={!isActive}
                inert={!isActive}
              >
                <div
                  className="absolute inset-0 size-full bg-surface max-[47.99rem]:h-[62%]"
                  aria-hidden="true"
                >
                  {movie?.posterUrl && (
                    <WatchRemoteImage
                      src={movie.posterUrl}
                      className="absolute inset-0 size-full object-cover object-[65%_center] [&:not([data-state=loaded])]:opacity-0 max-[47.99rem]:object-[65%_top] brightness-75"
                      priority={position === 0}
                    />
                  )}
                </div>

                <div className={HERO_GRADIENT_CLASS} aria-hidden="true" />

                <div className="relative z-1 mx-auto w-[min(calc(100%_-_4rem),76rem)] max-[47.99rem]:w-[calc(100%_-_2.5rem)]">
                  <div className="max-w-[38rem] min-[100rem]:max-w-[42rem] max-[47.99rem]:max-w-full">
                    {movie ? (
                      <WatchHeroMovie
                        movie={movie}
                        openInfo={() => dialog.current?.showModal()}
                      />
                    ) : query.isError ? (
                      <WatchHeroError
                        active={isActive}
                        error={query.error}
                        pending={query.isFetching}
                        retry={() => {
                          if (!query.isFetching) {
                            void query.refetch({ cancelRefetch: false });
                          }
                        }}
                      />
                    ) : (
                      <WatchHeroLoading active={isActive} />
                    )}
                  </div>
                </div>
              </article>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="absolute right-0 bottom-[2.35rem] left-0 z-2 mx-auto flex w-[min(calc(100%_-_4rem),76rem)] items-center justify-between gap-8 max-[47.99rem]:bottom-6 max-[47.99rem]:w-[calc(100%_-_2.5rem)] max-[47.99rem]:flex-col-reverse max-[47.99rem]:items-start max-[47.99rem]:gap-[.8rem]">
        <div className="flex shrink-0 items-center gap-[.85rem] max-[47.99rem]:gap-[.7rem]">
          <button
            type="button"
            className={HERO_NAV_BUTTON_CLASS}
            aria-label="Phim trước"
            disabled={SLUGS.length < 2}
            onClick={() => goTo(index - 1)}
          >
            <span aria-hidden="true">←</span>
          </button>

          <span
            className="min-w-16 text-[.85rem] tabular-nums [&_strong]:text-[1.05rem] [&_strong]:text-foreground [&_span]:text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            <strong>{String(index + 1).padStart(2, "0")}</strong>
            <span> / {String(SLUGS.length).padStart(2, "0")}</span>
          </span>

          <button
            type="button"
            className={HERO_NAV_BUTTON_CLASS}
            aria-label="Phim tiếp theo"
            disabled={SLUGS.length < 2}
            onClick={() => goTo(index + 1)}
          >
            <span aria-hidden="true">→</span>
          </button>
        </div>

        <div
          className="flex max-w-[70%] gap-[.7rem] overflow-x-auto p-[.45rem] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden max-[47.99rem]:-ml-[.2rem] max-[47.99rem]:w-full max-[47.99rem]:max-w-full max-[47.99rem]:gap-[.55rem]"
          ref={thumbList}
          role="group"
          aria-label="Chọn phim nổi bật"
        >
          {SLUGS.map((slug, position) => (
            <button
              type="button"
              key={slug}
              className={THUMBNAIL_BUTTON_CLASS}
              aria-label={
                queries[position].data
                  ? `Chọn ${queries[position].data!.name}`
                  : `Chọn phim ${position + 1}`
              }
              aria-pressed={index === position}
              title={queries[position].data?.name}
              onClick={() => goTo(position)}
              onKeyDown={event => {
                if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") {
                  return;
                }

                event.preventDefault();
                const offset = event.key === "ArrowRight" ? 1 : -1;
                const next = (position + offset + SLUGS.length) % SLUGS.length;

                goTo(next);
                (thumbList.current?.children[next] as HTMLButtonElement | undefined)?.focus();
              }}
            >
              {queries[position].data?.posterUrl && (
                <WatchRemoteImage
                  src={queries[position].data!.posterUrl}
                  className="size-full object-cover [&:not([data-state=loaded])]:opacity-0"
                />
              )}

              <span className="absolute bottom-1 left-[.3rem] rounded-[.3rem] bg-card px-[.3rem] py-[.15rem] text-[.6rem] font-bold text-foreground tabular-nums">
                {String(position + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>

      <dialog
        ref={dialog}
        className={HERO_DIALOG_CLASS}
        aria-labelledby={dialogHeadingId}
        onClick={event => {
          if (event.target === event.currentTarget) {
            dialog.current?.close();
          }
        }}
      >
        <div className="p-8 max-[47.99rem]:p-[1.35rem]">
          <div className="flex items-center justify-between gap-4 [&>p]:m-0">
            <p className="m-0 mb-[1.2rem] flex items-center gap-[.65rem] text-xs font-bold tracking-[.17em] text-muted-foreground max-[47.99rem]:mb-[.9rem] max-[47.99rem]:text-[.65rem]">
              THÔNG TIN PHIM
            </p>
            <button
              type="button"
              className={HERO_NAV_BUTTON_CLASS}
              autoFocus
              aria-label="Đóng thông tin phim"
              onClick={() => dialog.current?.close()}
            >
              ×
            </button>
          </div>

          <h2 className="font-bold" id={dialogHeadingId}>{active?.name ?? "Thông tin phim"}</h2>

          {active?.originalName && (
            <p className="m-0 mt-[.8rem] text-[clamp(.95rem,1.5vw,1.125rem)] leading-[1.5] text-muted-foreground max-[47.99rem]:text-[.9rem]">
              {active.originalName}
            </p>
          )}

          <p className="mx-0 my-6 text-[.95rem] leading-[1.9]">
            {active?.description ?? "Nguồn chưa cung cấp mô tả cho phim này."}
          </p>

          <dl className="m-0 [&>div]:mt-4 [&>div]:border-t [&>div]:border-border [&>div]:pt-4 [&>div]:text-[.85rem] [&>div]:leading-[1.7] [&_dt]:text-muted-foreground [&_dd]:m-0 [&_dd]:mt-1">
            {active?.director && (
              <div>
                <dt>Đạo diễn</dt>
                <dd>{active.director}</dd>
              </div>
            )}
            {active?.casts && (
              <div>
                <dt>Diễn viên</dt>
                <dd>{active.casts}</dd>
              </div>
            )}
          </dl>
        </div>
      </dialog>
    </section>
  );
}
