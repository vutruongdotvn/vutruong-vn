import { isWatchMovieSlug } from "./nguoncEndpoints";
import type { WatchCollectionSource } from "../../types/watchApi";

/** One route contract for every movie link. The detail page is a later step. */
export function watchMovieHref(slug: unknown): string | null {
  return isWatchMovieSlug(slug) ? `/watch/movie/${slug}` : null;
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
