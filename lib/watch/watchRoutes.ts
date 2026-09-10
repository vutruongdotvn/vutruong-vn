import { isWatchMovieSlug } from "./nguoncEndpoints";
import type { WatchCollectionSource } from "../../types/watchApi";

/** One route contract for every movie link. */
export function watchMovieHref(slug: unknown): string | null {
  return isWatchMovieSlug(slug) ? `/watch/movie/${slug}` : null;
}

/**
 * Converts NguồnC episode slugs into VT Zone's canonical route contract.
 * `tap-full` is intentionally exposed as `/full`; numbered episodes stay `/tap-n`.
 */
export function normalizeWatchEpisodeSegment(value: unknown): string | null {
  if (typeof value !== "string" || value !== value.trim()) return null;
  if (value === "full" || value === "tap-full") return "full";

  const match = /^tap-(\d{1,4})$/.exec(value);
  if (!match) return null;

  const episodeNumber = Number(match[1]);
  return episodeNumber > 0 ? `tap-${episodeNumber}` : null;
}

export function isWatchEpisodeSegment(value: unknown): value is string {
  return typeof value === "string"
    && (value === "full" || /^tap-[1-9]\d{0,3}$/.test(value));
}

export function watchEpisodeHref(movieSlug: unknown, episodeSlug: unknown): string | null {
  const segment = normalizeWatchEpisodeSegment(episodeSlug);
  return isWatchMovieSlug(movieSlug) && segment
    ? `/watch/movie/${movieSlug}/${segment}`
    : null;
}

const COLLECTION_SEGMENTS = {
  format: "danh-sach",
  genre: "the-loai",
  country: "quoc-gia",
} as const;

/**
 * Builds the future grid URL shown on each WatchSlider heading.
 * Add a new collection kind to COLLECTION_SEGMENTS when a matching route exists.
 */
export function watchCollectionHref(source: WatchCollectionSource): string | null {
  if (source.kind === "latest") {
    return "/watch/danh-sach/phim-moi-cap-nhat";
  }

  if (!isWatchMovieSlug(source.slug)) {
    return null;
  }

  return `/watch/${COLLECTION_SEGMENTS[source.kind]}/${source.slug}`;
}
