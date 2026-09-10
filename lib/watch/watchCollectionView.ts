import { isWatchMovieSlug } from "./nguoncEndpoints";
import type { WatchListMovie } from "../../types/watchApi";

export const WATCH_MAX_CARDS_PER_ROW = 24;

/** One API page; remove unusable/duplicate entries without fetching replacements. */
export function watchCollectionMovies(items: ReadonlyArray<WatchListMovie>): WatchListMovie[] {
  const seen = new Set<string>();
  const result: WatchListMovie[] = [];
  for (const item of items) {
    if (!item.name || !isWatchMovieSlug(item.slug) || seen.has(item.slug)) continue;
    seen.add(item.slug); result.push(item);
    if (result.length === WATCH_MAX_CARDS_PER_ROW) break;
  }
  return result;
}
