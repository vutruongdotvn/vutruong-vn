"use client";

import Link from "next/link";
import WatchRemoteImage from "@/components/watch/WatchRemoteImage";
import WatchEpisodeList from "@/components/watch/movie/WatchEpisodeList";
import WatchTrailerButton from "@/components/watch/movie/WatchTrailerButton";
import { watchEpisodeHref } from "@/lib/watch/watchRoutes";
import type { WatchMovieSummary } from "@/types/watchApi";

type Props = {
  movie: WatchMovieSummary;
};

const PRIMARY_BUTTON_CLASS = [
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border",
  "border-primary bg-primary px-5 text-sm font-semibold text-primary-foreground no-underline",
  "shadow-[0_10px_28px_color-mix(in_srgb,var(--foreground)_16%,transparent)]",
  "hover:opacity-90 focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-3",
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

function DetailFact({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;

  return (
    <div className="border-t border-border pt-4">
      <dt className="text-xs font-semibold tracking-wide text-muted-foreground">{label}</dt>
      <dd className="m-0 mt-1.5 text-sm leading-6 text-foreground">{value}</dd>
    </div>
  );
}

function EmptyEpisodeState() {
  return (
    <section
      className="rounded-3xl border border-border bg-card p-6 shadow-sm sm:p-8"
      aria-labelledby="watch-no-episode-heading"
    >
      <i className="fad fa-film-slash text-2xl text-muted-foreground" aria-hidden="true" />
      <h2 id="watch-no-episode-heading" className="m-0 mt-4 text-xl font-bold">
        Phim chưa có nguồn phát
      </h2>
      <p className="m-0 mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
        NguồnC chưa cung cấp tập phim hợp lệ. Nút Xem phim sẽ tự mở khi dữ liệu tập xuất hiện.
      </p>
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

  const categoryLine = [
    ...movie.formats,
    ...movie.genres,
    ...movie.countries,
  ].join(" · ");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <article className="relative isolate flex min-h-[max(52rem,100svh)] items-end overflow-hidden pt-28 pb-16 md:pb-20">
        <div className="absolute inset-0 bg-surface" aria-hidden="true">
          {movie.posterUrl && (
            <WatchRemoteImage
              src={movie.posterUrl}
              priority
              className="absolute inset-0 size-full object-cover object-center opacity-[.78] brightness-[.75] saturate-[.85] dark:opacity-[.58] dark:brightness-[.6] [&:not([data-state=loaded])]:opacity-0"
            />
          )}
        </div>

        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/80 via-background/25 to-transparent"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background from-0% via-background/92 via-28% to-background/5 to-100%"
          aria-hidden="true"
        />

        <div className="relative z-1 mx-auto grid w-[min(calc(100%_-_2rem),76rem)] gap-8 sm:w-[min(calc(100%_-_3rem),76rem)] md:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] md:items-end lg:gap-12">
          <div className="aspect-[2/3] w-[min(46vw,13rem)] overflow-hidden rounded-3xl border border-white/20 bg-muted shadow-[0_24px_70px_rgb(0_0_0/28%)] md:w-full">
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

          <div className="max-w-3xl">
            <Link
              href="/watch"
              prefetch={false}
              className="inline-flex items-center gap-2 text-[.68rem] font-bold tracking-[.18em] text-muted-foreground no-underline hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-3"
            >
              <i className="fad fa-arrow-left" aria-hidden="true" />
              WATCH · CHI TIẾT PHIM
            </Link>

            <h1 className="m-0 mt-4 text-[clamp(2.3rem,5vw,4.8rem)] font-extrabold leading-[1.02] tracking-[-.035em] text-balance wrap-anywhere">
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
                    className="rounded-lg border border-border bg-card/88 px-2.5 py-1.5 text-xs font-bold shadow-sm backdrop-blur-sm"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            )}

            {categoryLine && (
              <p className="m-0 mt-5 text-sm leading-7 text-muted-foreground">
                {categoryLine}
              </p>
            )}

            <p className="m-0 mt-5 max-w-3xl text-sm leading-7 text-foreground/88 sm:text-[.95rem] sm:leading-8">
              {movie.description ?? "NguồnC chưa cung cấp mô tả cho phim này."}
            </p>

            <div className="mt-7 flex flex-wrap items-start gap-3">
              {firstEpisodeHref ? (
                <Link href={firstEpisodeHref} prefetch={false} className={PRIMARY_BUTTON_CLASS}>
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

              <WatchTrailerButton movieName={movie.name} trailerUrl={movie.trailerUrl} />
            </div>

            <dl className="mt-9 grid max-w-3xl gap-x-8 gap-y-4 sm:grid-cols-2">
              <DetailFact label="Định dạng" value={movie.formats.join(", ") || null} />
              <DetailFact label="Thể loại" value={movie.genres.join(", ") || null} />
              <DetailFact label="Quốc gia" value={movie.countries.join(", ") || null} />
              <DetailFact label="Ngôn ngữ" value={movie.language} />
              <DetailFact label="Chất lượng" value={movie.quality} />
              <DetailFact label="Thời lượng" value={movie.duration} />
              <DetailFact label="Đạo diễn" value={movie.director} />
              <DetailFact label="Diễn viên" value={movie.casts} />
              <DetailFact label="Tiến độ" value={episodeProgress} />
              <DetailFact label="Ngày đăng" value={createdAt} />
              <DetailFact label="Cập nhật" value={updatedAt} />
            </dl>
          </div>
        </div>
      </article>

      <div className="mx-auto w-[min(calc(100%_-_2rem),76rem)] py-12 sm:w-[min(calc(100%_-_3rem),76rem)] sm:py-16">
        {movie.episodes.length > 0 ? (
          <WatchEpisodeList movieSlug={movie.slug} episodes={movie.episodes} />
        ) : (
          <EmptyEpisodeState />
        )}
      </div>
    </main>
  );
}
