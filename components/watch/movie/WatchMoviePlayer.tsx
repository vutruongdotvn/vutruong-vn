"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import WatchRemoteImage from "@/components/watch/WatchRemoteImage";
import WatchMoviePlayerSkeleton from "@/components/watch/movie/WatchMoviePlayerSkeleton";
import WatchRemotePlayer from "@/components/watch/movie/WatchRemotePlayer";
import WatchRuntimeMetadata from "@/components/watch/WatchRuntimeMetadata";
import { useWatchPlayback } from "@/hooks/watch/useWatchPlayback";
import {
  WATCH_COUNTRIES,
  WATCH_GENRES,
  type WatchDirectoryItem,
} from "@/lib/watch/watchDirectory";
import { watchEpisodeHref, watchMovieHref } from "@/lib/watch/watchRoutes";
import { WatchApiError, watchApiErrorMessage } from "@/types/watchApi";

type Props = {
  slug: string;
  episodeSegment: string;
};

type CompactFact = {
  label: string;
  value: string;
  icon: string;
};

const META_BADGE_CLASS = [
  "flex min-h-14 min-w-0 items-start gap-3 rounded-xl border border-border",
  "bg-background px-3.5 py-3 text-foreground",
  "shadow-[0_1px_0_rgb(0_0_0/2%)]",
].join(" ");

const TAXONOMY_BADGE_CLASS = [
  "inline-flex min-h-11 items-center gap-2.5 rounded-xl border border-border",
  "bg-background px-3.5 py-2 text-sm text-foreground",
  "shadow-[0_1px_0_rgb(0_0_0/2%)]",
].join(" ");

function normalizeDirectoryLabel(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .trim()
    .toLowerCase();
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

function InfoPanel({
  title,
  icon,
  description,
  className = "",
  children,
}: {
  title: string;
  icon: string;
  description?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={[
        "min-w-0 rounded-2xl border border-border bg-card p-4 sm:p-5",
        className,
      ].join(" ")}
    >
      <header className="mb-4 flex items-start gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-background text-muted-foreground">
          <i className={icon} aria-hidden="true" />
        </span>

        <div className="min-w-0">
          <h3 className="m-0 text-sm font-bold tracking-tight text-foreground">
            {title}
          </h3>

          {description && (
            <p className="m-0 mt-1 text-xs leading-5 text-muted-foreground">
              {description}
            </p>
          )}
        </div>
      </header>

      {children}
    </section>
  );
}

function InfoBadge({
  label,
  value,
  icon,
}: CompactFact) {
  return (
    <div className={META_BADGE_CLASS}>
      <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <i className={icon} aria-hidden="true" />
      </span>

      <div className="min-w-0">
        <p className="m-0 text-[.65rem] font-bold tracking-[.08em] text-muted-foreground">
          {label}
        </p>
        <p className="m-0 mt-1 break-words text-sm font-semibold leading-5 text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function TaxonomyBadge({
  kind,
  value,
}: {
  kind: "genre" | "country";
  value: string;
}) {
  const items = kind === "genre" ? WATCH_GENRES : WATCH_COUNTRIES;
  const item = findDirectoryItem(value, items);
  const baseHref = kind === "genre" ? "/watch/the-loai" : "/watch/quoc-gia";
  const icon = kind === "genre" ? "fad fa-masks-theater" : "fad fa-earth-asia";

  const content = (
    <>
      <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
        <i className={icon} aria-hidden="true" />
      </span>

      <span className="min-w-0 font-semibold">
        {value}
      </span>

      {item && (
        <i
          className="fad fa-arrow-up-right ml-auto text-[.65rem] text-muted-foreground"
          aria-hidden="true"
        />
      )}
    </>
  );

  if (!item) {
    return <span className={TAXONOMY_BADGE_CLASS}>{content}</span>;
  }

  return (
    <Link
      href={`${baseHref}/${item.slug}`}
      prefetch={false}
      className={[
        TAXONOMY_BADGE_CLASS,
        "no-underline transition-colors hover:border-foreground/25 hover:bg-accent",
        "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
      ].join(" ")}
      title={`Xem ${kind === "genre" ? "thể loại" : "quốc gia"} ${value}`}
    >
      {content}
    </Link>
  );
}

function playbackErrorMessage(error: unknown): string {
  if (
    error instanceof WatchApiError
    && error.code === "http_error"
    && error.details.status === 404
  ) {
    return "NguồnC không còn phim này hoặc đường dẫn phim chưa đúng.";
  }

  return watchApiErrorMessage(error);
}

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

function joinValues(values: ReadonlyArray<string>): string | null {
  return values.length > 0 ? values.join(", ") : null;
}

function episodeLabel(name: string, segment: string): string {
  if (segment === "full") return "FULL";
  if (/^\d+$/.test(name)) return `Tập ${name}`;
  if (/^tập\s+/i.test(name)) return name;
  if (segment.startsWith("tap-")) return `Tập ${segment.slice(4)}`;
  return name;
}

function progressNumber(value: string | null): number | null {
  if (!value) return null;

  const matches = value.match(/\d+/g);
  if (!matches?.length) return null;

  const parsed = Number(matches[matches.length - 1]);
  return Number.isFinite(parsed) ? parsed : null;
}

export default function WatchMoviePlayer({ slug, episodeSegment }: Props) {
  const query = useWatchPlayback(slug);
  const [sourceIndex, setSourceIndex] = useState(0);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [showArtwork, setShowArtwork] = useState(true);

  useEffect(() => setSourceIndex(0), [episodeSegment]);
  useEffect(() => setDetailsExpanded(false), [slug]);

  if (query.isPending) {
    return <WatchMoviePlayerSkeleton />;
  }

  if (query.isError || !query.data) {
    const detailHref = watchMovieHref(slug) ?? "/watch";

    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 pt-24 pb-12 text-foreground">
        <section
          className="w-full max-w-xl rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9"
          role="status"
        >
          <i
            className="fad fa-cloud-exclamation text-3xl text-muted-foreground"
            aria-hidden="true"
          />
          <h1 className="m-0 mt-5 text-2xl font-bold">Chưa tải được trình phát</h1>
          <p className="m-0 mt-3 leading-7 text-muted-foreground">
            {playbackErrorMessage(query.error)}
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={query.isFetching}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              onClick={() => {
                if (!query.isFetching) {
                  void query.refetch({ cancelRefetch: false });
                }
              }}
            >
              <i
                className={query.isFetching
                  ? "fad fa-spinner-third fa-spin"
                  : "fad fa-rotate-right"}
                aria-hidden="true"
              />
              {query.isFetching ? "Đang tải…" : "Thử lại"}
            </button>

            <Link
              href={detailHref}
              prefetch={false}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-foreground no-underline hover:bg-accent"
            >
              <i className="fad fa-arrow-left" aria-hidden="true" />
              Về chi tiết phim
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const manifest = query.data;
  const episode = manifest.episodes.find(item => item.segment === episodeSegment);
  const movieHref = watchMovieHref(slug) ?? "/watch";
  const firstEpisodeHref = manifest.episodes[0]
    ? watchEpisodeHref(slug, manifest.episodes[0].segment)
    : null;

  if (!episode) {
    return (
      <main className="min-h-screen bg-background px-4 pt-28 pb-16 text-foreground sm:px-6">
        <section
          className="mx-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10"
          role="status"
        >
          <i className="fad fa-film-slash text-3xl text-muted-foreground" aria-hidden="true" />
          <p className="m-0 mt-5 text-xs font-bold tracking-[.16em] text-muted-foreground">
            WATCH · TRÌNH PHÁT
          </p>
          <h1 className="m-0 mt-3 text-2xl font-bold sm:text-3xl">
            Tập phim không tồn tại
          </h1>
          <p className="m-0 mt-3 leading-7 text-muted-foreground">
            Tập này không có nguồn phát hợp lệ hoặc vừa được NguồnC cập nhật lại.
          </p>

          <div className="mt-7 flex flex-wrap gap-3">
            {firstEpisodeHref && (
              <Link
                href={firstEpisodeHref}
                prefetch={false}
                className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground no-underline hover:opacity-90"
              >
                <i className="fad fa-play" aria-hidden="true" />
                Phát tập đầu tiên
              </Link>
            )}

            <Link
              href={movieHref}
              prefetch={false}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-foreground no-underline hover:bg-accent"
            >
              <i className="fad fa-arrow-left" aria-hidden="true" />
              Về chi tiết phim
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const sources = episode.sources;
  const effectiveSourceIndex = sourceIndex < sources.length ? sourceIndex : 0;
  const source = sources[effectiveSourceIndex];
  const hasAlternateSource = sources.length > 1;
  const episodeDisplayLabel = episodeLabel(episode.name, episode.segment);

  const episodeProgress = [
    manifest.currentEpisode,
    manifest.totalEpisodes !== null ? `${manifest.totalEpisodes} tập` : null,
  ].filter((value): value is string => Boolean(value)).join(" / ") || null;

  const currentNumber = progressNumber(manifest.currentEpisode);
  const isCompleted = manifest.totalEpisodes !== null
    && currentNumber !== null
    && currentNumber >= manifest.totalEpisodes;

  const statusText = isCompleted
    ? `Hoàn tất (${manifest.totalEpisodes}/${manifest.totalEpisodes})`
    : episodeProgress ?? "Đang cập nhật";

  const createdAt = formatDate(manifest.createdAt);
  const updatedAt = formatDate(manifest.updatedAt);

  const releaseFacts: CompactFact[] = [
    {
      label: "ĐỊNH DẠNG",
      value: joinValues(manifest.formats) ?? "",
      icon: "fad fa-clapperboard",
    },
    {
      label: "NGÔN NGỮ",
      value: manifest.language ?? "",
      icon: "fad fa-language",
    },
    {
      label: "CHẤT LƯỢNG",
      value: manifest.quality ?? "",
      icon: "fad fa-high-definition",
    },
    {
      label: "THỜI LƯỢNG",
      value: manifest.duration ?? "",
      icon: "fad fa-clock",
    },
    {
      label: "TIẾN ĐỘ",
      value: episodeProgress ?? "",
      icon: "fad fa-bars-progress",
    },
    {
      label: "NĂM",
      value: manifest.year ?? "",
      icon: "fad fa-calendar",
    },
  ].filter(item => Boolean(item.value));

  const movieFacts: CompactFact[] = [
    {
      label: "TÊN GỐC",
      value: manifest.originalName ?? "",
      icon: "fad fa-font-case",
    },
    {
      label: "ĐẠO DIỄN",
      value: manifest.director ?? "",
      icon: "fad fa-video",
    },
    {
      label: "DIỄN VIÊN",
      value: manifest.casts ?? "",
      icon: "fad fa-users",
    },
    {
      label: "NGÀY ĐĂNG",
      value: createdAt ?? "",
      icon: "fad fa-calendar-plus",
    },
    {
      label: "CẬP NHẬT",
      value: updatedAt ?? "",
      icon: "fad fa-clock-rotate-left",
    },
  ].filter(item => Boolean(item.value));

  function chooseNextSource() {
    if (sources.length < 2) return;

    setSourceIndex(current => {
      const safeCurrent = current < sources.length ? current : 0;
      return (safeCurrent + 1) % sources.length;
    });
  }

  return (
    <>
      <WatchRuntimeMetadata
        title={`Xem phim ${manifest.movieName} - ${episodeDisplayLabel} | Watch`}
        description={manifest.description}
        imageUrl={manifest.thumbUrl}
      />

      <main className="min-h-screen bg-background text-foreground">
        {/* Theater stays centered and dark in both themes. */}
        <section className="bg-[#0a0d11] pt-14">
          <div className="mx-auto w-full max-w-[80rem]">
            {source ? (
              <WatchRemotePlayer
                key={`${episode.segment}-${effectiveSourceIndex}-${source.embedUrl}`}
                src={source.embedUrl}
                title={`${manifest.movieName} — ${episode.name} — ${source.serverName}`}
                hasAlternateSource={hasAlternateSource}
                onChooseAlternateSource={hasAlternateSource ? chooseNextSource : undefined}
              />
            ) : (
              <div className="flex aspect-video items-center justify-center rounded-3xl border border-white/10 bg-black px-6 text-center text-white/70">
                Nguồn phát của tập này chưa hợp lệ.
              </div>
            )}
          </div>
        </section>

        <div className="mx-auto w-full max-w-[80rem] px-4 pt-5 pb-24 md:pb-8 sm:px-6 sm:pt-6">
          {/* Movie identity block inspired by the uploaded reference. */}
          <section
            className={[
              "grid items-start gap-7",
              showArtwork && manifest.thumbUrl
                ? "md:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-[12rem_minmax(0,1fr)]"
                : "grid-cols-1",
            ].join(" ")}
            aria-labelledby="watch-player-movie-title"
          >
            {showArtwork && manifest.thumbUrl && (
              <div className="mx-auto w-36 md:mx-0 md:w-full hidden md:block">
                <div className="aspect-[2/3] overflow-hidden rounded-xl bg-muted shadow-[0_18px_50px_rgb(0_0_0/18%)]">
                  <WatchRemoteImage
                    src={manifest.thumbUrl}
                    alt={`Poster ${manifest.movieName}`}
                    className="size-full object-cover [&:not([data-state=loaded])]:opacity-0"
                  />

                </div>

                {/* {manifest.thumbUrl && (
                  <label className="inline-flex cursor-pointer items-center gap-2.5 text-sm text-muted-foreground mt-3">
                    <span>{showArtwork ? "Ẩn ảnh" : "Hiện ảnh"}</span>
                    <span className="relative inline-flex">
                      <input
                        type="checkbox"
                        className="peer sr-only"
                        checked={showArtwork}
                        onChange={event => setShowArtwork(event.target.checked)}
                      />
                      <span className="h-7 w-12 rounded-full bg-muted transition-colors peer-checked:bg-foreground/75" />
                      <span className="absolute top-1 left-1 size-5 rounded-full bg-background shadow-sm transition-transform peer-checked:translate-x-5" />
                    </span>
                  </label>
                )} */}

              </div>
            )}

            <div className="min-w-0">
              <h1
                id="watch-player-movie-title"
                className="m-0 text-[clamp(1.5rem,3vw,2rem)] font-extrabold leading-[1.15] tracking-tight text-balance"
              >
                {manifest.movieName}
              </h1>

              {manifest.originalName && (
                <p className="m-0 mt-2 text-sm font-medium text-muted-foreground/75 sm:text-base">
                  {manifest.originalName}
                </p>
              )}

              {/* <div className="mt-4 flex flex-wrap gap-2">
                {manifest.quality && (
                  <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-bold">
                    {manifest.quality}
                  </span>
                )}
                {manifest.year && (
                  <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    {manifest.year}
                  </span>
                )}
                {manifest.formats.slice(0, 2).map(format => (
                  <span
                    key={format}
                    className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground"
                  >
                    {format}
                  </span>
                ))}
                <span className="rounded-md border border-border bg-card px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  {episodeDisplayLabel}
                </span>
              </div> */}

              {/* {manifest.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {manifest.genres.slice(0, 4).map(genre => (
                    <span
                      key={genre}
                      className="rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )} */}

              {/* <div className="mt-5">
                <span
                  className={[
                    "inline-flex min-h-9 items-center gap-2 rounded-full border px-3.5 text-sm font-semibold",
                    isCompleted
                      ? "border-foreground/15 bg-foreground/[.055] text-foreground"
                      : "border-border bg-card text-muted-foreground",
                  ].join(" ")}
                >
                  <i
                    className={isCompleted ? "fad fa-circle-check" : "fad fa-circle-play"}
                    aria-hidden="true"
                  />
                  {statusText}
                </span>
              </div> */}

              <div className="mt-3 max-w-5xl">
                <p
                  className={[
                    "m-0 text-sm leading-6 text-muted-foreground sm:text-[.9375rem] sm:leading-6 text-justify",
                    "bg-white/75 backdrop-blur-md dark:bg-card border border-border dark:border-border/50 p-3 sm:p-4 rounded-xl",
                    // detailsExpanded ? "" : "line-clamp-10",
                  ].join(" ")}
                >
                  <span className="block font-bold mb-1.5 tracking-wider text-sm">NỘI DUNG PHIM</span>

                  {manifest.description ?? "NguồnC chưa cung cấp mô tả cho phim này."}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <Link
                    href={movieHref}
                    prefetch={false}
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-6 text-sm font-semibold no-underline transition-[background-color,border-color,color,transform] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:scale-[.985] motion-reduce:transition-none motion-reduce:active:scale-100 border-border/55 bg-card text-foreground hover:border-foreground/20 hover:bg-accent"
                  >
                    <i className="fad fa-arrow-left text-xs" aria-hidden="true" />
                    Quay lại
                  </Link>

                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-6 text-sm font-semibold no-underline transition-[background-color,border-color,color,transform] focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2 active:scale-[.985] motion-reduce:transition-none motion-reduce:active:scale-100 border-border/55 bg-card text-foreground hover:border-foreground/20 hover:bg-accent cursor-pointer"
                    aria-expanded={detailsExpanded}
                    onClick={() => setDetailsExpanded(value => !value)}
                  >
                    <i
                      className={detailsExpanded ? "fad fa-compress" : "fad fa-expand"}
                      aria-hidden="true"
                    />
                    {detailsExpanded ? "Thu gọn" : "Xem thêm"}
                  </button>
                </div>

                {detailsExpanded && (
                  <div className="mt-3 grid items-stretch gap-3 lg:grid-cols-2 xl:grid-cols-2">
                    <InfoPanel
                      title="Thể loại"
                      icon="fad fa-masks-theater"
                      description="Chọn một thể loại để mở danh sách phim tương ứng."
                      className="h-full"
                    >
                      {manifest.genres.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {manifest.genres.map((genre, index) => (
                            <TaxonomyBadge
                              key={`genre-${genre}-${index}`}
                              kind="genre"
                              value={genre}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="m-0 text-sm text-muted-foreground">
                          Chưa có thông tin thể loại.
                        </p>
                      )}
                    </InfoPanel>

                    <InfoPanel
                      title="Quốc gia"
                      icon="fad fa-earth-asia"
                      description="Mở trực tiếp trang phim của quốc gia tương ứng."
                      className="h-full"
                    >
                      {manifest.countries.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {manifest.countries.map((country, index) => (
                            <TaxonomyBadge
                              key={`country-${country}-${index}`}
                              kind="country"
                              value={country}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="m-0 text-sm text-muted-foreground">
                          Chưa có thông tin quốc gia.
                        </p>
                      )}
                    </InfoPanel>

                    <InfoPanel
                      title="Phát hành"
                      icon="fad fa-circle-info"
                      description="Thông số phát hành và trạng thái hiện tại của phim."
                      className="h-full"
                    >
                      {releaseFacts.length > 0 ? (
                        <div className="grid gap-2 min-[24rem]:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                          {releaseFacts.map(item => (
                            <InfoBadge
                              key={`${item.label}-${item.value}`}
                              {...item}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="m-0 text-sm text-muted-foreground">
                          Chưa có metadata phát hành.
                        </p>
                      )}
                    </InfoPanel>

                    <InfoPanel
                      title="Thông tin phim"
                      icon="fad fa-film"
                      description="Tên gốc, ê-kíp và thời điểm cập nhật dữ liệu."
                      className="h-full"
                    >
                      {movieFacts.length > 0 ? (
                        <div className="grid gap-2">
                          {movieFacts.map(item => (
                            <InfoBadge
                              key={`${item.label}-${item.value}`}
                              {...item}
                            />
                          ))}
                        </div>
                      ) : (
                        <p className="m-0 text-sm text-muted-foreground">
                          Chưa có thông tin bổ sung.
                        </p>
                      )}
                    </InfoPanel>
                  </div>
                )}
              </div>
              {/* Episode + server area matching the reference hierarchy. */}
              <section
                className="mt-12"
                aria-labelledby="watch-episode-heading"
              >
                <div className="flex flex-wrap items-center justify-between gap-5">
                  <h2
                    id="watch-episode-heading"
                    className="m-0 inline-flex items-center gap-1.5 text-base font-bold sm:text-xl"
                  >
                    Danh sách tập

                    <span className="text-foreground">
                      ({manifest.episodes.length}
                      {manifest.totalEpisodes !== null ? `/${manifest.totalEpisodes}` : ""})
                    </span>

                  </h2>

                  {/* {sources.length > 0 && (
                <label className="flex items-center gap-3 text-sm text-muted-foreground">
                  <span className="whitespace-nowrap">Chọn Server:</span>
                  <span className="relative">
                    <select
                      value={effectiveSourceIndex}
                      onChange={event => setSourceIndex(Number(event.target.value))}
                      className="min-h-11 min-w-48 appearance-none rounded-xl border border-border bg-card py-2 pr-10 pl-4 text-sm font-semibold text-foreground outline-none focus:border-foreground/35 focus:ring-2 focus:ring-ring/30"
                      aria-label="Chọn server phát"
                    >
                      {sources.map((item, itemIndex) => (
                        <option key={`${item.serverName}-${itemIndex}`} value={itemIndex}>
                          {item.serverName}
                        </option>
                      ))}
                    </select>
                    <i
                      className="fad fa-chevron-down pointer-events-none absolute top-1/2 right-4 -translate-y-1/2 text-xs text-muted-foreground"
                      aria-hidden="true"
                    />
                  </span>
                </label>
              )} */}
                </div>

                {hasAlternateSource && (
                  <div className="mt-6 flex flex-wrap gap-2">
                    {sources.map((item, itemIndex) => {
                      const isActive = effectiveSourceIndex === itemIndex;

                      return (
                        <button
                          key={`${item.serverName}-${itemIndex}`}
                          type="button"
                          aria-pressed={isActive}
                          className={[
                            "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-4",
                            "text-sm font-semibold transition-colors",
                            "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                            isActive
                              ? "border-foreground/25 bg-card text-foreground shadow-sm"
                              : "border-transparent bg-muted/55 text-muted-foreground hover:bg-muted hover:text-foreground",
                          ].join(" ")}
                          onClick={() => {
                            if (!isActive) setSourceIndex(itemIndex);
                          }}
                        >
                          <i
                            className={isActive ? "fad fa-circle-check" : "fad fa-server"}
                            aria-hidden="true"
                          />
                          {item.serverName}
                        </button>
                      );
                    })}
                  </div>
                )}

                <nav
                  className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8"
                  aria-label="Các tập phim"
                >
                  {manifest.episodes.map(item => {
                    const href = watchEpisodeHref(slug, item.segment);
                    if (!href) return null;

                    const isCurrent = item.segment === episode.segment;
                    const label = episodeLabel(item.name, item.segment);

                    return (
                      <Link
                        key={item.segment}
                        href={href}
                        prefetch={false}
                        aria-current={isCurrent ? "page" : undefined}
                        className={[
                          "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border px-3",
                          "text-sm font-semibold no-underline transition-[background-color,border-color,color,transform]",
                          "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                          "active:scale-[.985] motion-reduce:transition-none motion-reduce:active:scale-100",
                          isCurrent
                            ? "border-foreground bg-foreground text-background"
                            : "border-border/55 bg-card text-foreground hover:border-foreground/20 hover:bg-accent",
                        ].join(" ")}
                      >
                        <i
                          className={isCurrent ? "fad fa-play" : "fad fa-circle-play"}
                          aria-hidden="true"
                        />
                        <span>{label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </section>
            </div>
          </section>


        </div>
      </main>
    </>
  );
}
