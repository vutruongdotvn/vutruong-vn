"use client";

import Link from "next/link";
import WatchRemoteImage from "@/components/watch/WatchRemoteImage";
import { watchMovieHref } from "@/lib/watch/watchRoutes";
import type { WatchListMovie } from "@/types/watchApi";

const POSTER_IMAGE_CLASS = [
  "absolute inset-0 size-full object-cover",
  "transition-transform duration-[220ms] ease-out",
  "[&:not([data-state=loaded])]:opacity-0",
  "[@media(hover:hover)_and_(pointer:fine)]:group-hover/watch-card:scale-[1.035]",
  "motion-reduce:transition-none",
].join(" ");

const OPEN_ICON_CLASS = [
  "absolute right-[.65rem] bottom-[.65rem] z-1",
  "grid size-[2.2rem] translate-y-[.4rem] place-items-center rounded-full",
  "bg-primary text-primary-foreground opacity-0",
  "transition-[opacity,transform] duration-200 ease-out",
  "group-focus-visible/watch-card:translate-y-0",
  "group-focus-visible/watch-card:opacity-100",
  "[@media(hover:hover)_and_(pointer:fine)]:group-hover/watch-card:translate-y-0",
  "[@media(hover:hover)_and_(pointer:fine)]:group-hover/watch-card:opacity-100",
  "motion-reduce:transition-none",
].join(" ");

const META_TITLE_CLASS = [
  "mx-[.2rem] mt-[.7rem] mb-0 truncate text-center",
  "text-sm font-[650] leading-[1.5]",
  "max-[39.99rem]:text-[.8rem]",
].join(" ");

/** Presentational only. List data never causes an N+1 movie-detail request. */
export default function WatchMovieCard({ movie }: { movie: WatchListMovie }) {
  const href = watchMovieHref(movie.slug);

  if (!href || !movie.name) {
    return null;
  }

  return (
    <article className="h-full min-w-0" data-watch-movie-card>
      <Link
        href={href}
        prefetch={false}
        className="group/watch-card block h-full rounded-[.8rem] text-foreground no-underline focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
        aria-label={`Chi tiết phim: ${movie.name}`}
      >
        <div className="relative isolate aspect-[2/3] overflow-hidden rounded-[.85rem] border border-border bg-muted max-[39.99rem]:rounded-[.65rem]">
          <span
            className="absolute inset-0 grid place-items-center text-[2rem] text-muted-foreground opacity-35"
            aria-hidden="true"
          >
            <i className="fad fa-film" />
          </span>

          {movie.thumbUrl && (
            <WatchRemoteImage src={movie.thumbUrl} className={POSTER_IMAGE_CLASS} />
          )}

          {movie.quality && (
            <span className="absolute top-2 right-2 z-1 max-w-[calc(100%_-_1rem)] truncate rounded-[.35rem] border border-border bg-card px-[.4rem] py-1 text-[.65rem] font-bold leading-[1.3] text-foreground">
              {movie.quality}
            </span>
          )}

          {movie.currentEpisode && (
            <span className="absolute bottom-2 left-2 z-1 max-w-[calc(100%_-_1rem)] truncate rounded-[.35rem] border border-border bg-card px-[.4rem] py-1 text-[.65rem] font-bold leading-[1.3] text-foreground">
              {movie.currentEpisode}
            </span>
          )}

          <span className={OPEN_ICON_CLASS} aria-hidden="true">
            <i className="fad fa-arrow-up-right" />
          </span>
        </div>

        <h3 className={META_TITLE_CLASS} title={movie.name}>
          {movie.name}
        </h3>

        {movie.originalName && (
          <p
            className="mx-[.2rem] mt-[.2rem] mb-0 truncate text-center text-xs leading-[1.5] text-muted-foreground max-[39.99rem]:text-[.7rem]"
            title={movie.originalName}
          >
            {movie.originalName}
          </p>
        )}

        {movie.language && (
          <p className="mx-[.2rem] mt-[.35rem] mb-0 truncate text-center text-[.65rem] leading-[1.5] text-muted-foreground">
            {movie.language}
          </p>
        )}
      </Link>
    </article>
  );
}
