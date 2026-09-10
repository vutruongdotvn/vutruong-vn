"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { watchEpisodeHref, watchMovieHref } from "@/lib/watch/watchRoutes";
import type { WatchEpisodeSummary } from "@/types/watchApi";

type Props = {
  movieSlug: string;
  episodes: ReadonlyArray<WatchEpisodeSummary>;
  currentSegment?: string;
};

const INITIAL_VISIBLE_EPISODES = 48;

function episodeLabel(episode: WatchEpisodeSummary): string {
  if (episode.segment === "full") return "FULL";
  if (/^\d+$/.test(episode.name)) return `Tập ${episode.name}`;
  return episode.name;
}

export default function WatchEpisodeList({ movieSlug, episodes, currentSegment }: Props) {
  const currentIndex = episodes.findIndex(episode => episode.segment === currentSegment);
  const initialCount = Math.max(INITIAL_VISIBLE_EPISODES, currentIndex + 1);
  const movieHref = watchMovieHref(movieSlug);
  const [expanded, setExpanded] = useState(false);

  const visibleEpisodes = useMemo(
    () => expanded ? episodes : episodes.slice(0, initialCount),
    [episodes, expanded, initialCount],
  );

  return (
    <section aria-labelledby="watch-episode-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="m-0 text-[.68rem] font-bold tracking-[.18em] text-muted-foreground">
            DANH SÁCH PHÁT
          </p>
          <h2 id="watch-episode-heading" className="m-0 mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Chọn tập phim
          </h2>
          <p className="m-0 mt-2 text-sm leading-6 text-muted-foreground">
            {episodes.length} tập có nguồn phát hợp lệ
          </p>
        </div>

        {currentSegment && movieHref && (
          <Link
            href={movieHref}
            prefetch={false}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground no-underline hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          >
            <i className="fad fa-circle-info" aria-hidden="true" />
            Chi tiết phim
          </Link>
        )}
      </div>

      <nav className="mt-7 flex flex-wrap gap-2" aria-label="Các tập phim">
        {visibleEpisodes.map(episode => {
          const href = watchEpisodeHref(movieSlug, episode.segment);
          if (!href) return null;

          const isCurrent = currentSegment === episode.segment;

          return (
            <Link
              key={episode.segment}
              href={href}
              prefetch={false}
              aria-current={isCurrent ? "page" : undefined}
              className={[
                "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border px-4",
                "text-sm font-semibold no-underline transition-colors",
                "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
                isCurrent
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-foreground hover:bg-accent",
              ].join(" ")}
            >
              {episodeLabel(episode)}
              {episode.sourceCount > 1 && (
                <span className={isCurrent ? "text-primary-foreground/70" : "text-muted-foreground"}>
                  · {episode.sourceCount} nguồn
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {episodes.length > initialCount && (
        <button
          type="button"
          className="mt-5 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-border bg-transparent px-4 text-sm font-semibold text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
          aria-expanded={expanded}
          onClick={() => setExpanded(value => !value)}
        >
          <i className={expanded ? "fad fa-chevron-up" : "fad fa-chevron-down"} aria-hidden="true" />
          {expanded ? "Thu gọn danh sách" : `Hiện tất cả ${episodes.length} tập`}
        </button>
      )}
    </section>
  );
}
