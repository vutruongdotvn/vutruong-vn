"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import WatchRemoteImage from "@/components/watch/WatchRemoteImage";
import WatchEpisodeList from "@/components/watch/movie/WatchEpisodeList";
import WatchTrailerButton from "@/components/watch/movie/WatchTrailerButton";
import {
  WATCH_COUNTRIES,
  WATCH_GENRES,
  WATCH_LISTS,
  type WatchDirectoryItem,
} from "@/lib/watch/watchDirectory";
import { watchEpisodeHref } from "@/lib/watch/watchRoutes";
import type { WatchMovieSummary } from "@/types/watchApi";

type Props = {
  movie: WatchMovieSummary;
};

type TaxonomyKind = "format" | "genre" | "country";

const PRIMARY_BUTTON_CLASS = [
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border",
  "border-primary bg-primary px-5 text-sm font-semibold text-primary-foreground no-underline",
  "shadow-[0_10px_28px_color-mix(in_srgb,var(--foreground)_16%,transparent)]",
  "transition-[transform,opacity,box-shadow] duration-200 ease-out",
  "hover:-translate-y-px hover:opacity-92",
  "hover:shadow-[0_14px_34px_color-mix(in_srgb,var(--foreground)_20%,transparent)]",
  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-3",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
].join(" ");

const TAXONOMY_LINK_CLASS = [
  "inline-flex min-h-8 items-center gap-1.5 rounded-full border border-border",
  "bg-card/72 px-3 py-1 text-xs font-semibold text-foreground no-underline",
  "shadow-sm backdrop-blur-sm transition-[background-color,border-color] duration-200",
  "hover:border-foreground/25 hover:bg-accent",
  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
].join(" ");

function formatDate(value: string | null): string | null {
  if (!value) return null;

  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(date);
}

function normalizeDirectoryLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .toLowerCase();
}

function directoryConfig(kind: TaxonomyKind): {
  items: ReadonlyArray<WatchDirectoryItem>;
  baseHref: string;
} {
  if (kind === "genre") {
    return { items: WATCH_GENRES, baseHref: "/watch/the-loai" };
  }

  if (kind === "country") {
    return { items: WATCH_COUNTRIES, baseHref: "/watch/quoc-gia" };
  }

  return { items: WATCH_LISTS, baseHref: "/watch/danh-sach" };
}

function findDirectoryItem(
  value: string,
  items: ReadonlyArray<WatchDirectoryItem>,
): WatchDirectoryItem | null {
  const normalized = normalizeDirectoryLabel(value);
  const rawSlug = value.trim().toLowerCase();

  return items.find(item => (
    normalizeDirectoryLabel(item.name) === normalized
    || item.slug === rawSlug
  )) ?? null;
}

function DetailFact({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  if (!value) return null;

  return (
    <div className="border-t border-border/80 pt-4">
      <dt className="text-[.68rem] font-bold tracking-[.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="m-0 mt-1.5 text-sm leading-6 text-foreground">
        {value}
      </dd>
    </div>
  );
}

function DetailGroup({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border-t border-border/80 pt-4">
      <dt className="text-[.68rem] font-bold tracking-[.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="m-0 mt-2">
        {children}
      </dd>
    </div>
  );
}

function TaxonomyValues({
  kind,
  values,
}: {
  kind: TaxonomyKind;
  values: ReadonlyArray<string>;
}) {
  if (values.length === 0) return null;

  const { items, baseHref } = directoryConfig(kind);

  return (
    <div className="flex flex-wrap gap-2">
      {values.map((value, index) => {
        const item = findDirectoryItem(value, items);

        if (!item) {
          return (
            <span
              key={`${value}-${index}`}
              className="inline-flex min-h-8 items-center rounded-full border border-border/70 bg-card/45 px-3 py-1 text-xs font-medium text-muted-foreground"
            >
              {value}
            </span>
          );
        }

        return (
          <Link
            key={`${item.slug}-${index}`}
            href={`${baseHref}/${item.slug}`}
            prefetch={false}
            className={TAXONOMY_LINK_CLASS}
            title={`Xem ${value}`}
          >
            <span>{value}</span>
            <i className="fad fa-arrow-up-right text-[.6rem] opacity-55" aria-hidden="true" />
          </Link>
        );
      })}
    </div>
  );
}

function EmptyEpisodeState() {
  return (
    <section
      className="border-t border-border pt-8"
      aria-labelledby="watch-no-episode-heading"
    >
      <div className="flex max-w-xl items-start gap-4">
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-border bg-card text-muted-foreground">
          <i className="fad fa-film-slash" aria-hidden="true" />
        </span>

        <div>
          <p className="m-0 text-[.68rem] font-bold tracking-[.16em] text-muted-foreground">
            DANH SÁCH PHÁT
          </p>
          <h2
            id="watch-no-episode-heading"
            className="m-0 mt-2 text-xl font-bold tracking-tight"
          >
            Phim chưa có nguồn phát
          </h2>
          <p className="m-0 mt-2 text-sm leading-6 text-muted-foreground">
            Chưa có nguồn phát hợp lệ cho phim này.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function WatchMovieInfo({ movie }: Props) {
  const firstEpisode = movie.episodes[0];
  const firstEpisodeHref = firstEpisode
    ? watchEpisodeHref(movie.slug, firstEpisode.segment)
    : null;

  const updatedAt = formatDate(movie.updatedAt);
  const createdAt = formatDate(movie.createdAt);

  const episodeProgress = [
    movie.currentEpisode,
    movie.totalEpisodes !== null ? `${movie.totalEpisodes} tập` : null,
  ].filter((value): value is string => Boolean(value)).join(" / ") || null;

  const badges = [
    movie.quality,
    movie.language,
    movie.year,
    movie.duration,
    movie.currentEpisode,
  ].filter((value): value is string => Boolean(value));

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article
        className={[
          "relative isolate overflow-hidden",
          "pt-36 pb-16 sm:pt-44 sm:pb-20",
          "lg:pt-[clamp(18rem,31vh,24rem)] lg:pb-24",
        ].join(" ")}
      >
        {/* Backdrop chỉ chiếm phần đầu trang; phần danh sách tập phía dưới hòa về body. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(62rem,100svh)] overflow-hidden bg-surface max-[47.99rem]:h-[34rem]"
          aria-hidden="true"
        >
          {movie.posterUrl && (
            <WatchRemoteImage
              src={movie.posterUrl}
              priority
              className={[
                "absolute inset-0 size-full object-cover object-center",
                "opacity-[.82] brightness-[.82] saturate-[.9]",
                "dark:opacity-[.62] dark:brightness-[.62]",
                "transition-opacity duration-500 [&:not([data-state=loaded])]:opacity-0",
                "motion-reduce:transition-none",
              ].join(" ")}
            />
          )}

          {/* Pixel/grid tối ở cả light và dark, cùng ngôn ngữ thị giác với WatchHero. */}
          <div
            className="absolute inset-0 mix-blend-multiply opacity-[.24] dark:opacity-[.3] max-[47.99rem]:opacity-[.18] max-[47.99rem]:dark:opacity-[.23]"
            style={{
              backgroundImage: [
                "repeating-linear-gradient(to right, rgba(0,0,0,0.34) 0 1px, transparent 1px 4px)",
                "repeating-linear-gradient(to bottom, rgba(0,0,0,0.28) 0 1px, transparent 1px 4px)",
              ].join(", "),
            }}
          />

          <div
            className="absolute inset-0 mix-blend-multiply opacity-[.18] dark:opacity-[.24] max-[47.99rem]:opacity-[.14] max-[47.99rem]:dark:opacity-[.18]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.72) 0 0.72px, rgba(0,0,0,0.2) 0.73px 1.1px, transparent 1.15px)",
              backgroundSize: "4px 4px",
            }}
          />

          {/* <div
            className="absolute inset-0 bg-gradient-to-r from-[var(--background)]/82 via-[var(--background)]/26 to-transparent max-[47.99rem]:from-[var(--background)]/58 max-[47.99rem]:via-transparent"
          /> */}

          <div
            className={[
              "absolute inset-0",
              "bg-gradient-to-t from-[var(--background)] from-0%",
              "via-[color-mix(in_srgb,var(--background)_92%,transparent)] via-30%",
              "to-transparent to-78%",
              "max-[47.99rem]:via-[color-mix(in_srgb,var(--background)_94%,transparent)]",
              "max-[47.99rem]:via-40% max-[47.99rem]:to-82%",
            ].join(" ")}
          />

          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/12 to-transparent dark:from-black/24" />
        </div>

        <div
          className={[
            "relative z-2 mx-auto grid w-[min(calc(100%_-_2rem),76rem)] gap-8",
            "sm:w-[min(calc(100%_-_3rem),76rem)]",
            "md:grid-cols-[13rem_minmax(0,1fr)] md:items-start",
            "lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12",
          ].join(" ")}
        >
          {/* Cột poster */}
          <aside className="md:pt-10">
            <div
              className={[
                "aspect-[2/3] w-[min(42vw,11rem)] overflow-hidden rounded-[1.35rem]",
                "bg-muted shadow-[0_24px_70px_rgb(0_0_0/25%)]",
                "md:w-full md:rounded-[1.6rem]",
              ].join(" ")}
            >
              {movie.thumbUrl ? (
                <WatchRemoteImage
                  src={movie.thumbUrl}
                  priority
                  alt={`Poster ${movie.name}`}
                  className="size-full object-cover [&:not([data-state=loaded])]:opacity-0"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-muted-foreground">
                  <i className="fad fa-film text-4xl" aria-hidden="true" />
                  <span className="sr-only">Không có poster</span>
                </div>
              )}
            </div>

            <div className="mt-5 hidden md:block">
              <p className="m-0 text-[.68rem] font-bold tracking-[.16em] text-muted-foreground">
                NỘI DUNG PHIM
              </p>
              <p className="m-0 mt-3 text-sm leading-6 text-muted-foreground text-justify">
                {movie.description ?? "Đang cập nhật."}
              </p>
            </div>
          </aside>

          {/* Cột nội dung chính + danh sách phát */}
          <div className="min-w-0 max-w-4xl">
            <Link
              href="/watch"
              prefetch={false}
              className="inline-flex items-center gap-2 rounded-full text-sm font-medium text-foreground/50 border border-border/50 dark:border-foreground/15 bg-background/35 backdrop-blur-sm px-5 py-1.5 hover:opacity-90 active:scale-98 no-underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-3"
            >
              <i className="fad fa-arrow-left" aria-hidden="true" />
              Trở lại
            </Link>

            <h1
              className={[
                "m-0 mt-5 text-[clamp(2rem,5vw,3rem)]",
                "font-extrabold leading-[1.15] text-balance wrap-anywhere",
              ].join(" ")}
            >
              {movie.name}
            </h1>

            {movie.originalName && (
              <p className="m-0 mt-3 text-base leading-7 text-muted-foreground sm:text-lg">
                {movie.originalName}
              </p>
            )}

            {badges.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {badges.map((badge, index) => (
                  <span
                    key={`${badge}-${index}`}
                    className="rounded-full border border-border bg-card/80 px-2.5 py-1.5 text-xs font-bold shadow-sm backdrop-blur-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-6 md:hidden">
              <p className="m-0 text-[.68rem] font-bold tracking-[.16em] text-muted-foreground">
                NỘI DUNG PHIM
              </p>
              <p className="m-0 mt-3 text-sm leading-6 text-foreground/80 text-justify">
                {movie.description ?? "NguồnC chưa cung cấp mô tả cho phim này."}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap items-start gap-3">
              {firstEpisodeHref ? (
                <Link
                  href={firstEpisodeHref}
                  prefetch={false}
                  className={PRIMARY_BUTTON_CLASS}
                >
                  <i className="fad fa-play" aria-hidden="true" />
                  Xem phim
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className={`${PRIMARY_BUTTON_CLASS} cursor-not-allowed opacity-45`}
                  title="Phim chưa có tập phát hợp lệ"
                >
                  <i className="fad fa-play" aria-hidden="true" />
                  Xem phim
                </button>
              )}

              <WatchTrailerButton
                movieName={movie.name}
                trailerUrl={movie.trailerUrl}
              />
            </div>

            <dl className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
              <DetailGroup label="ĐỊNH DẠNG">
                <TaxonomyValues kind="format" values={movie.formats} />
              </DetailGroup>

              <DetailGroup label="THỂ LOẠI">
                <TaxonomyValues kind="genre" values={movie.genres} />
              </DetailGroup>

              <DetailGroup label="QUỐC GIA">
                <TaxonomyValues kind="country" values={movie.countries} />
              </DetailGroup>

              <DetailFact label="NGÔN NGỮ" value={movie.language} />
              <DetailFact label="CHẤT LƯỢNG" value={movie.quality} />
              <DetailFact label="THỜI LƯỢNG" value={movie.duration} />
              <DetailFact label="ĐẠO DIỄN" value={movie.director} />
              <DetailFact label="DIỄN VIÊN" value={movie.casts} />
              <DetailFact label="TIẾN ĐỘ" value={episodeProgress} />
              <DetailFact label="NGÀY ĐĂNG" value={createdAt} />
              <DetailFact label="CẬP NHẬT" value={updatedAt} />
            </dl>

            <div className="mt-12 border-t border-border pt-10 sm:mt-14">
              {movie.episodes.length > 0 ? (
                <WatchEpisodeList
                  movieSlug={movie.slug}
                  episodes={movie.episodes}
                />
              ) : (
                <EmptyEpisodeState />
              )}
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}