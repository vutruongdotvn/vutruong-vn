import { WatchApiError, type WatchCollectionSource } from "../../types/watchApi";

export const NGUONC_API_ORIGIN = "https://phim.nguonc.com";

const WATCH_EMBED_HOST = /^embed\d{1,3}\.streamc\.xyz$/i;
const WATCH_TRAILER_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
  "youtube-nocookie.com",
  "www.youtube-nocookie.com",
]);

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

export function watchCollectionUrl(source: WatchCollectionSource, page = 1): string {
  if (!source || typeof source !== "object" || !Number.isSafeInteger(page) || page < 1) {
    throw new WatchApiError("invalid_request");
  }
  if (source.kind === "latest") return watchLatestUrl(page);
  const directories = { format: "danh-sach", genre: "the-loai", country: "quoc-gia" } as const;
  if ((source.kind !== "format" && source.kind !== "genre" && source.kind !== "country")
    || !isWatchMovieSlug(source.slug)) throw new WatchApiError("invalid_request");
  const url = new URL(`/api/films/${directories[source.kind]}/${source.slug}`, NGUONC_API_ORIGIN);
  url.searchParams.set("page", String(page));
  return url.href;
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

/**
 * NguồnC currently returns StreamC iframe URLs. Keep this allowlist strict:
 * a new provider must be reviewed here before any browser iframe receives it.
 */
export function safeWatchEmbedUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2_000 || value !== value.trim()) return null;

  try {
    const url = new URL(value);
    const queryKeys = [...url.searchParams.keys()];
    const hash = url.searchParams.get("hash");

    const validOrigin = url.protocol === "https:"
      && !url.port
      && !url.username
      && !url.password
      && !url.hash
      && WATCH_EMBED_HOST.test(url.hostname);
    const validResource = url.pathname === "/embed.php"
      && queryKeys.length === 1
      && queryKeys[0] === "hash"
      && Boolean(hash && /^[a-f0-9]{32}$/i.test(hash));

    if (!validOrigin || !validResource) {
      return null;
    }

    return url.href;
  } catch {
    return null;
  }
}

/** Adds only our own autoplay hint after the source URL passed the allowlist. */
export function watchAutoplayEmbedUrl(value: unknown): string | null {
  const safeUrl = safeWatchEmbedUrl(value);
  if (!safeUrl) return null;

  const url = new URL(safeUrl);
  url.searchParams.set("autoplay", "1");
  return url.href;
}

/**
 * Trailer data is undocumented today. If NguồnC adds a YouTube field later,
 * reduce it to a canonical video URL and discard every unrelated parameter.
 */
export function safeWatchTrailerUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 2_000 || value !== value.trim()) return null;

  try {
    const url = new URL(value);
    if (url.protocol !== "https:" || url.port || url.username || url.password) return null;

    const hostname = url.hostname.toLowerCase();
    let videoId: string | null = null;

    if (hostname === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? null;
    } else if (WATCH_TRAILER_HOSTS.has(hostname)) {
      const pathParts = url.pathname.split("/").filter(Boolean);
      videoId = url.pathname === "/watch"
        ? url.searchParams.get("v")
        : (["embed", "shorts", "live"].includes(pathParts[0] ?? "") ? pathParts[1] ?? null : null);
    }

    return videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)
      ? `https://www.youtube.com/watch?v=${videoId}`
      : null;
  } catch {
    return null;
  }
}
