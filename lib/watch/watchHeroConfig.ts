import { isWatchMovieSlug } from "./nguoncEndpoints";

/** Edit ONLY these slugs (5–7 recommended). No title, image or movie data here.
 * Nguonc documents /api/film/{slug}; a raw ID is not a documented lookup route.
 */
export const WATCH_HERO_SLUGS: readonly string[] = [
  "anh-hung-2026",
  "tai",
  "quy-nhap-trang-2",
  "tho-oi",
  "con-ke-ba-nghe",
];

/** A bad entry cannot create arbitrary requests or unbounded fan-out. */
export function selectWatchHeroSlugs(values: readonly unknown[]): string[] {
  return [...new Set(values.filter(isWatchMovieSlug))].slice(0, 7);
}
