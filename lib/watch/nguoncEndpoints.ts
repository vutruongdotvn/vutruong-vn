import { WatchApiError } from "../../types/watchApi";

export const NGUONC_API_ORIGIN = "https://phim.nguonc.com";

/** Fixed documented endpoints only; callers never supply an API origin or URL. */
export function watchLatestUrl(page: number): string {
  if (!Number.isSafeInteger(page) || page < 1) throw new WatchApiError("invalid_request");
  const url = new URL("/api/films/phim-moi-cap-nhat", NGUONC_API_ORIGIN);
  url.searchParams.set("page", String(page));
  return url.href;
}

export function isWatchMovieSlug(value: unknown): value is string {
  return typeof value === "string" && value.length <= 200
    && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value);
}

export function watchMovieUrl(slug: string): string {
  if (!isWatchMovieSlug(slug)) throw new WatchApiError("invalid_request");
  return new URL(`/api/film/${slug}`, NGUONC_API_ORIGIN).href;
}

/** These paths were checked against the real Nguonc detail responses.
 * Other hosts, HTML/SVG, credentials, redirects supplied as URLs, and query
 * strings are not enabled by configuration. Invalid images get a local fallback.
 */
export function safeWatchImageUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2_000 || value !== value.trim()) return null;
  try {
    const url = new URL(value);
    if (url.origin !== NGUONC_API_ORIGIN || url.username || url.password || url.search || url.hash
      || !/^\/public\/images\/[a-zA-Z0-9_./%-]+\.(?:jpg|jpeg|png|webp|avif)$/i.test(url.pathname)
      || /%(?:2e|2f|5c|00)/i.test(url.pathname)) return null;
    return url.href;
  } catch { return null; }
}
