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
  "relative isolate w-full overflow-hidden bg-background text-foreground",
  "[&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-ring",
  "[&_button:focus-visible]:outline-offset-4",
  "[&_button:disabled]:cursor-default [&_button:disabled]:opacity-45",
  "motion-reduce:[&_*]:duration-0! motion-reduce:[&_*]:animate-none!",
  "motion-reduce:[&_*]:scroll-auto!",
].join(" ");

const HERO_ARTICLE_CLASS = [
  "relative box-border flex min-h-[max(46rem,100svh)] items-end overflow-hidden",
  "bg-background pt-32 pb-56",
  "max-[47.99rem]:min-h-[40rem]",
  "max-[47.99rem]:pt-24 max-[47.99rem]:pb-20",
].join(" ");

const HERO_CONTENT_CLASS = [
  "relative z-2 mx-auto w-[min(calc(100%_-_4rem),72rem)]",
  "max-[47.99rem]:w-[calc(100%_-_2.25rem)]",
].join(" ");

const HERO_CONTENT_INNER_CLASS = [
  "min-[100rem]:max-w-full",
  "max-[47.99rem]:max-w-[34rem]",
].join(" ");

const HERO_PRIMARY_LINK_CLASS = [
  "group/hero-cta inline-flex min-h-[3.35rem] items-center justify-center",
  "gap-3 rounded-full border border-primary bg-primary px-6 py-3",
  "text-sm font-bold text-primary-foreground no-underline",
  "shadow-[0_12px_34px_color-mix(in_srgb,var(--foreground)_18%,transparent)]",
  "transition-[transform,opacity,box-shadow] duration-200 ease-out",
  "hover:-translate-y-px hover:opacity-95",
  "hover:shadow-[0_15px_40px_color-mix(in_srgb,var(--foreground)_22%,transparent)]",
  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
  "max-[47.99rem]:min-h-12 max-[47.99rem]:px-5 max-[47.99rem]:text-[.82rem]",
].join(" ");

const HERO_NAV_BUTTON_CLASS = [
  "grid size-11 shrink-0 cursor-pointer place-items-center rounded-full",
  "border border-border/80 bg-card/88 text-sm text-foreground",
  "shadow-sm backdrop-blur-md transition-[background-color,opacity] duration-200",
  "hover:bg-accent",
].join(" ");

const THUMBNAIL_BUTTON_CLASS = [
  "group/hero-thumb relative aspect-[16/9] min-w-0 flex-1 cursor-pointer overflow-hidden",
  "rounded-[.85rem] bg-muted p-0 opacity-35 grayscale-50",
  "shadow-sm transition-[opacity,border-color,transform,box-shadow] duration-300 ease-out",
  "hover:opacity-85",
  "aria-pressed:-translate-y-0 aria-pressed:opacity-100 aria-pressed:grayscale-0",
  "aria-pressed:shadow-[0_8px_26px_color-mix(in_srgb,var(--foreground)_16%,transparent)]",
  "motion-reduce:transition-none motion-reduce:aria-pressed:translate-y-0",
].join(" ");

const MOBILE_INDICATOR_CLASS = [
  "h-1.5 cursor-pointer rounded-full border-0 bg-foreground/25 p-0",
  "transition-[width,background-color,opacity] duration-300",
  "aria-pressed:w-7 aria-pressed:bg-foreground aria-pressed:opacity-90",
  "w-1.5 hover:bg-foreground/55",
  "motion-reduce:transition-none",
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

function WatchHeroMovie({ movie }: { movie: WatchMovieSummary }) {
  const movieHref = watchMovieHref(movie.slug);
  const badges = [
    movie.quality,
    movie.language,
    movie.year,
    movie.currentEpisode,
  ].filter((value): value is string => Boolean(value));

  const categories = [
    ...movie.genres.slice(0, 2),
    ...movie.countries.slice(0, 1),
  ];

  return (
    <>
      <h2
        data-watch-hero-title
        className={[
          "m-0 w-full max-w-[800px] text-[clamp(1.75rem,5vw,2.75rem)] font-extrabold",
          "leading-[1.135] text-white/90 dark:text-white/75 text-shadow-lg text-balance wrap-anywhere",
        ].join(" ")}
      >
        {movie.name}
      </h2>

      {movie.originalName && (
        <p className="m-0 mt-3 max-w-[34rem] truncate text-[clamp(.9rem,1.25vw,1.05rem)] leading-6 text-white/75 dark:text-white/50 max-[47.99rem]:mt-2 max-[47.99rem]:text-[.78rem]">
          {movie.originalName}
        </p>
      )}

      {badges.length > 0 && (
        <div className="mt-5 flex flex-wrap gap-2 max-[47.99rem]:mt-4 max-[47.99rem]:gap-1.5">
          {badges.map((value, badgeIndex) => (
            <span
              key={`${badgeIndex}-${value}`}
              className={[
                "rounded-full border border-border/35 dark:border-white/4 bg-card/15 dark:bg-card/5 px-3 py-1.5",
                "text-xs font-medium leading-none text-white/75 dark:text-white/50 backdrop-blur-xs",
              ].join(" ")}
            >
              {value}
            </span>
          ))}
        </div>
      )}

      {categories.length > 0 && (
        <p className="m-0 mt-4 text-[.82rem] leading-6 text-white/75 dark:text-muted-foreground max-[47.99rem]:mt-3 max-[47.99rem]:line-clamp-1 max-[47.99rem]:text-[.72rem]">
          {categories.join(" · ")}
        </p>
      )}

      {movie.description && (
        <p
          className={[
            "m-0 mt-4 line-clamp-2 max-w-[37rem] text-[.92rem] leading-6 text-white/75 dark:text-white/50",
            "max-[47.99rem]:mt-3 max-[47.99rem]:line-clamp-2",
            "max-[47.99rem]:max-w-[31rem] max-[47.99rem]:text-[.8rem] max-[47.99rem]:leading-6",
          ].join(" ")}
        >
          {movie.description}
        </p>
      )}

      {movieHref && (
        <div className="mt-7 max-[47.99rem]:mt-5">
          <Link href={movieHref} prefetch={false} className={HERO_PRIMARY_LINK_CLASS}>
            <span>Xem chi tiết</span>
            <i
              className="fad fa-arrow-up-right transition-transform duration-200 group-hover/hero-cta:translate-x-0.5 group-hover/hero-cta:-translate-y-0.5 motion-reduce:transition-none"
              aria-hidden="true"
            />
          </Link>
        </div>
      )}
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
      className="max-w-[31rem] py-4 max-[47.99rem]:py-2"
      role={active ? "status" : undefined}
    >
      <div className="mb-4 grid size-11 place-items-center rounded-full border border-border bg-card/80 text-muted-foreground backdrop-blur-md">
        <i className="fad fa-cloud-exclamation" aria-hidden="true" />
      </div>
      <h2 className="m-0 text-[clamp(2rem,4vw,3.4rem)] font-extrabold leading-[1.05] tracking-[-.035em]">
        Chưa tải được phim này
      </h2>
      <p className="m-0 mt-4 text-sm leading-7 text-muted-foreground">
        {heroErrorMessage(error)}
      </p>
      <button
        type="button"
        className="mt-6 inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-border bg-card/90 px-5 text-sm font-semibold text-foreground backdrop-blur-md hover:bg-accent"
        disabled={pending}
        onClick={retry}
      >
        <i className={pending ? "fad fa-spinner-third fa-spin" : "fad fa-rotate-right"} aria-hidden="true" />
        {pending ? "Đang tải…" : "Thử lại phim này"}
      </button>
    </div>
  );
}

function WatchHeroLoading({ active }: { active: boolean }) {
  return (
    <div
      className="max-w-[34rem] py-4 max-[47.99rem]:py-2"
      role={active ? "status" : undefined}
    >
      <span className="sr-only">Đang tải phim nổi bật…</span>
      <div className="h-2.5 w-24 rounded-full bg-skeleton" aria-hidden="true" />
      <div className="mt-5 h-14 w-[88%] rounded-2xl bg-skeleton max-[47.99rem]:h-11" aria-hidden="true" />
      <div className="mt-3 h-14 w-[68%] rounded-2xl bg-skeleton max-[47.99rem]:h-11" aria-hidden="true" />
      <div className="mt-5 flex gap-2" aria-hidden="true">
        <span className="h-7 w-14 rounded-full bg-skeleton" />
        <span className="h-7 w-18 rounded-full bg-skeleton" />
        <span className="h-7 w-16 rounded-full bg-skeleton" />
      </div>
      <div className="mt-5 h-3 w-[78%] rounded-full bg-skeleton" aria-hidden="true" />
      <div className="mt-3 h-3 w-[62%] rounded-full bg-skeleton" aria-hidden="true" />
      <div className="mt-7 h-12 w-36 rounded-full bg-skeleton" aria-hidden="true" />
    </div>
  );
}

/**
 * Hero dùng một danh sách slug hữu hạn trong watchHeroConfig.ts.
 * Chuyển slide chỉ đổi index, không tạo query ngoài danh sách cấu hình.
 * watchHeroConfig.ts tiếp tục là nơi duy nhất quản lý phim nào xuất hiện.
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
  const headingId = useId();

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);

    update();
    media.addEventListener("change", update);

    return () => media.removeEventListener("change", update);
  }, []);

  function goTo(next: number) {
    const instance = swiper.current;

    if (!instance || instance.destroyed || SLUGS.length < 2) {
      return;
    }

    const normalized = Math.max(0, Math.min(next, SLUGS.length - 1));
    instance.slideTo(normalized);
  }

  if (SLUGS.length === 0) {
    return (
      <section
        className="flex min-h-96 items-end bg-background px-6 pt-28 pb-12 text-foreground sm:px-8"
        aria-labelledby={headingId}
        data-watch-hero
      >
        <div className="mx-auto w-full max-w-6xl">
          <h1 id={headingId} className="m-0 text-3xl font-extrabold">Phim nổi bật</h1>
          <p className="m-0 mt-3 text-sm text-muted-foreground">Chưa có phim trong bộ sưu tập này.</p>
        </div>
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
        speed={reducedMotion ? 0 : 500}
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
                <div className="absolute inset-0 z-0 bg-surface" aria-hidden="true">
                  {movie?.posterUrl && (
                    <WatchRemoteImage
                      src={movie.posterUrl}
                      priority={position === 0}
                      className={[
                        "absolute inset-0 size-full object-cover",
                        "object-[66%_center] brightness-75 saturate-80 contrast-125",
                        "transition-opacity duration-500 [&:not([data-state=loaded])]:opacity-0",
                        "max-[47.99rem]:object-cover max-[47.99rem]:brightness-[.78]",
                        "motion-reduce:transition-none",
                      ].join(" ")}
                    />
                  )}
                </div>

                {/* Texture LED/pixel grid rõ hơn, gần ảnh mẫu hơn. */}
                <div
                  className="pointer-events-none absolute inset-0 z-1 mix-blend-multiply opacity-[.28] max-[47.99rem]:opacity-[.22]"
                  aria-hidden="true"
                  style={{
                    backgroundImage: [
                      "repeating-linear-gradient(to right, rgba(255,255,255,0.18) 0 1px, transparent 1px 4px)",
                      "repeating-linear-gradient(to bottom, rgba(255,255,255,0.14) 0 1px, transparent 1px 4px)",
                    ].join(", "),
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-0 z-1 mix-blend-multiply opacity-[.24] max-[47.99rem]:opacity-[.18]"
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      "radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.65) 0 0.75px, rgba(0,0,0,0.16) 0.76px 1.15px, transparent 1.2px)",
                    backgroundSize: "4px 4px",
                  }}
                />

                <div
                  className="pointer-events-none absolute inset-0 z-1 mix-blend-soft-light opacity-[.1] max-[47.99rem]:opacity-[.08]"
                  aria-hidden="true"
                  style={{
                    backgroundImage:
                      "linear-gradient(to bottom, rgba(255,255,255,0.12), rgba(255,255,255,0.03) 18%, rgba(0,0,0,0.05) 100%)",
                  }}
                />

                {/* Desktop: tăng độ đọc ở phía nội dung bên trái mà không tạo box riêng. */}
                {/* <div
                  className={[
                    "pointer-events-none absolute inset-0 z-1",
                    "bg-gradient-to-r from-[var(--background)]/88 from-0% via-[var(--background)]/34 via-42% to-transparent to-72%",
                    "max-[47.99rem]:hidden",
                  ].join(" ")}
                  aria-hidden="true"
                /> */}

                {/* Gradient chính kéo từ body lên poster, dùng chung desktop/mobile. */}
                <div
                  className={[
                    "pointer-events-none absolute inset-0 z-1",
                    "bg-gradient-to-t from-[var(--background)] from-0%",
                    "via-[color-mix(in_srgb,var(--background)_88%,transparent)] via-24%",
                    "to-transparent to-48%",
                    "max-[47.99rem]:via-[color-mix(in_srgb,var(--background)_94%,transparent)]",
                    "max-[47.99rem]:via-34% max-[47.99rem]:to-65%",
                  ].join(" ")}
                  aria-hidden="true"
                />

                <div className={HERO_CONTENT_CLASS}>
                  <div className={HERO_CONTENT_INNER_CLASS}>
                    {movie ? (
                      <WatchHeroMovie movie={movie} />
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

      <div
        className={[
          "absolute right-0 bottom-24 left-0 z-3 mx-auto hidden",
          "w-[min(calc(100%_-_4rem),76rem)] items-center gap-5 min-[48rem]:flex",
        ].join(" ")}
      >
        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            className={HERO_NAV_BUTTON_CLASS}
            aria-label="Phim trước"
            disabled={SLUGS.length < 2 || index === 0}
            onClick={() => goTo(index - 1)}
          >
            <i className="fad fa-chevron-left" aria-hidden="true" />
          </button>

          <span
            className="min-w-15 text-center text-xs font-bold tabular-nums text-muted-foreground"
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="text-foreground">{String(index + 1).padStart(2, "0")}</span>
            <span> / {String(SLUGS.length).padStart(2, "0")}</span>
          </span>

          <button
            type="button"
            className={HERO_NAV_BUTTON_CLASS}
            aria-label="Phim tiếp theo"
            disabled={SLUGS.length < 2 || index === SLUGS.length - 1}
            onClick={() => goTo(index + 1)}
          >
            <i className="fad fa-chevron-right" aria-hidden="true" />
          </button>
        </div>

        <div
          className="grid min-w-0 flex-1 grid-flow-col auto-cols-fr gap-2.5"
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
            >
              {queries[position].data?.posterUrl && (
                <WatchRemoteImage
                  src={queries[position].data!.posterUrl}
                  className={[
                    "absolute inset-0 size-full object-cover",
                    "transition-transform duration-300",
                    "[&:not([data-state=loaded])]:opacity-0",
                    "group-hover/hero-thumb:scale-[1.035]",
                    "motion-reduce:transition-none",
                  ].join(" ")}
                />
              )}

              <span
                className={[
                  "absolute inset-x-0 bottom-0 h-1/2",
                  "bg-gradient-to-t from-black/55 to-transparent",
                ].join(" ")}
                aria-hidden="true"
              />

              <span className="absolute right-2 bottom-1.5 text-[.58rem] font-extrabold tracking-[.08em] text-white tabular-nums drop-shadow-sm">
                {String(position + 1).padStart(2, "0")}
              </span>
            </button>
          ))}
        </div>
      </div>

      {SLUGS.length > 1 && (
        <div
          className="absolute right-0 bottom-6 left-0 z-3 mx-auto flex w-[calc(100%_-_2.25rem)] items-center justify-center gap-2 min-[48rem]:hidden"
          role="group"
          aria-label="Chọn phim nổi bật"
        >
          {SLUGS.map((slug, position) => (
            <button
              type="button"
              key={slug}
              className={MOBILE_INDICATOR_CLASS}
              aria-label={
                queries[position].data
                  ? `Chọn ${queries[position].data!.name}`
                  : `Chọn phim ${position + 1}`
              }
              aria-pressed={index === position}
              onClick={() => goTo(position)}
            />
          ))}
        </div>
      )}
    </section>
  );
}