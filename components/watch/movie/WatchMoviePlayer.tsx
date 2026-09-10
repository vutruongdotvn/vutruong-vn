"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import WatchEpisodeList from "@/components/watch/movie/WatchEpisodeList";
import WatchMoviePlayerSkeleton from "@/components/watch/movie/WatchMoviePlayerSkeleton";
import WatchRemotePlayer from "@/components/watch/movie/WatchRemotePlayer";
import { useWatchPlayback } from "@/hooks/watch/useWatchPlayback";
import { watchEpisodeHref, watchMovieHref } from "@/lib/watch/watchRoutes";
import { WatchApiError, watchApiErrorMessage } from "@/types/watchApi";

type Props = {
  slug: string;
  episodeSegment: string;
};

function playbackErrorMessage(error: unknown): string {
  if (error instanceof WatchApiError && error.code === "http_error" && error.details.status === 404) {
    return "NguồnC không còn phim này hoặc đường dẫn phim chưa đúng.";
  }

  return watchApiErrorMessage(error);
}

export default function WatchMoviePlayer({ slug, episodeSegment }: Props) {
  const query = useWatchPlayback(slug);
  const [sourceIndex, setSourceIndex] = useState(0);

  useEffect(() => setSourceIndex(0), [episodeSegment]);

  if (query.isPending) {
    return <WatchMoviePlayerSkeleton />;
  }

  if (query.isError || !query.data) {
    const detailHref = watchMovieHref(slug) ?? "/watch";

    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 pt-24 pb-12 text-foreground">
        <section className="w-full max-w-xl rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9" role="status">
          <i className="fad fa-cloud-exclamation text-3xl text-muted-foreground" aria-hidden="true" />
          <h1 className="m-0 mt-5 text-2xl font-bold">Chưa tải được trình phát</h1>
          <p className="m-0 mt-3 leading-7 text-muted-foreground">{playbackErrorMessage(query.error)}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={query.isFetching}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              onClick={() => {
                if (!query.isFetching) void query.refetch({ cancelRefetch: false });
              }}
            >
              <i
                className={query.isFetching ? "fad fa-spinner-third fa-spin" : "fad fa-rotate-right"}
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
        <section className="mx-auto w-full max-w-2xl rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-10" role="status">
          <i className="fad fa-film-slash text-3xl text-muted-foreground" aria-hidden="true" />
          <p className="m-0 mt-5 text-xs font-bold tracking-[.16em] text-muted-foreground">WATCH · TRÌNH PHÁT</p>
          <h1 className="m-0 mt-3 text-2xl font-bold sm:text-3xl">Tập phim không tồn tại</h1>
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

  const source = episode.sources[sourceIndex] ?? episode.sources[0];

  return (
    <main className="min-h-screen bg-background px-4 pt-24 pb-16 text-foreground sm:px-6">
      <div className="mx-auto w-full max-w-6xl">
        <Link
          href={movieHref}
          prefetch={false}
          className="inline-flex items-center gap-2 text-xs font-bold tracking-[.14em] text-muted-foreground no-underline hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-3"
        >
          <i className="fad fa-arrow-left" aria-hidden="true" />
          CHI TIẾT PHIM
        </Link>

        <div className="mt-5 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="m-0 text-2xl font-bold tracking-tight sm:text-4xl">{manifest.movieName}</h1>
            <p className="m-0 mt-2 text-sm text-muted-foreground">
              {episode.segment === "full"
                ? "Bản FULL"
                : /^\d+$/.test(episode.name) ? `Tập ${episode.name}` : episode.name}
              {manifest.originalName ? ` · ${manifest.originalName}` : ""}
            </p>
          </div>

          <div className="flex flex-wrap justify-end gap-2">
            {source && (
              <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground">
                {source.serverName}
              </span>
            )}
            <span className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {episode.sources.length} nguồn phát
            </span>
          </div>
        </div>

        <div className="mt-7">
          {source ? (
            <WatchRemotePlayer
              key={`${episode.segment}-${sourceIndex}`}
              src={source.embedUrl}
              title={`${manifest.movieName} — ${episode.name} — ${source.serverName}`}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center rounded-3xl border border-border bg-black px-6 text-center text-white/70">
              Nguồn phát của tập này chưa hợp lệ.
            </div>
          )}
        </div>

        {episode.sources.length > 1 && (
          <section className="mt-7" aria-labelledby="watch-server-heading">
            <h2 id="watch-server-heading" className="m-0 text-sm font-bold">Chọn nguồn phát</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              {episode.sources.map((item, index) => (
                <button
                  key={`${item.serverName}-${index}`}
                  type="button"
                  aria-pressed={sourceIndex === index}
                  className={[
                    "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border px-4 text-sm font-semibold",
                    "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                    sourceIndex === index
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-foreground hover:bg-accent",
                  ].join(" ")}
                  onClick={() => setSourceIndex(index)}
                >
                  <i className="fad fa-server" aria-hidden="true" />
                  {item.serverName}
                </button>
              ))}
            </div>
          </section>
        )}

        <div className="mt-14 border-t border-border pt-10">
          <WatchEpisodeList
            movieSlug={slug}
            episodes={manifest.episodes}
            currentSegment={episode.segment}
          />
        </div>
      </div>
    </main>
  );
}
