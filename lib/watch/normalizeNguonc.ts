import {
  WatchApiError,
  type WatchLatestPage,
  type WatchMovieSummary,
  type WatchPlaybackEpisode,
  type WatchPlaybackManifest,
  type WatchPlaybackSource,
} from "../../types/watchApi";
import {
  safeWatchEmbedUrl,
  safeWatchImageUrl,
  safeWatchTrailerUrl,
} from "./nguoncEndpoints";
import { normalizeWatchEpisodeSegment } from "./watchRoutes";

function record(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new WatchApiError("invalid_response", { field });
  }
  return value as Record<string, unknown>;
}

// Pure text processing: no DOMParser, HTML insertion, links or remote embeds.
function plainText(value: unknown, limit = 300): string | null {
  if (typeof value !== "string") return null;
  return shortText(value.slice(0, 20_000)
    .replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(?:nbsp|amp|quot|apos|lt|gt);/g, entity => ({
      "&nbsp;": " ", "&amp;": "&", "&quot;": '"', "&apos;": "'", "&lt;": "<", "&gt;": ">",
    })[entity] ?? " ").replace(/\s+/g, " "), limit);
}

function categoryLabels(value: unknown, groupName: string): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  const result: string[] = [];
  for (const entry of Object.values(value).slice(0, 12)) {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    const row = entry as Record<string, unknown>;
    const group = row.group;
    if (!group || typeof group !== "object" || Array.isArray(group)
      || (group as Record<string, unknown>).name !== groupName || !Array.isArray(row.list)) continue;
    for (const item of row.list.slice(0, 12)) {
      if (!item || typeof item !== "object" || Array.isArray(item)) continue;
      const label = plainText((item as Record<string, unknown>).name, 80);
      if (label && !result.includes(label)) result.push(label);
    }
  }
  return result.slice(0, 8);
}

function optionalNonNegativeInteger(value: unknown): number | null {
  if (typeof value === "number" && Number.isSafeInteger(value) && value >= 0) {
    return value;
  }

  if (typeof value === "string" && /^\d{1,4}$/.test(value)) {
    return Number(value);
  }

  return null;
}

function optionalDate(value: unknown): string | null {
  const text = shortText(value, 80);
  return text && Number.isFinite(Date.parse(text)) ? text : null;
}

function firstTrailerUrl(movie: Record<string, unknown>): string | null {
  // NguồnC does not currently document a trailer key. These candidates are
  // inert unless the API itself starts returning an allowlisted YouTube URL.
  const candidates = [
    movie.trailer_url,
    movie.trailer,
    movie.youtube_url,
    movie.youtube,
  ];

  for (const candidate of candidates) {
    const url = safeWatchTrailerUrl(candidate);
    if (url) return url;
  }

  return null;
}

type MutablePlaybackEpisode = {
  name: string;
  segment: string;
  sources: WatchPlaybackSource[];
};

function episodeOrder(segment: string): number {
  if (segment === "full") return 0;
  return Number(segment.replace("tap-", ""));
}

/**
 * Validate episode routes and provider URLs once. Detail callers only receive
 * route summaries; the playback normalizer below is the sole caller retaining
 * the allowlisted iframe URLs.
 */
function playableEpisodes(value: unknown): WatchPlaybackEpisode[] {
  if (!Array.isArray(value)) return [];

  const episodes = new Map<string, MutablePlaybackEpisode>();

  for (const [serverIndex, serverValue] of value.slice(0, 24).entries()) {
    if (!serverValue || typeof serverValue !== "object" || Array.isArray(serverValue)) {
      continue;
    }

    const server = serverValue as Record<string, unknown>;
    const serverName = plainText(server.server_name, 80) ?? `Nguồn ${serverIndex + 1}`;
    if (!Array.isArray(server.items)) continue;

    for (const itemValue of server.items.slice(0, 1_000)) {
      if (!itemValue || typeof itemValue !== "object" || Array.isArray(itemValue)) {
        continue;
      }

      const item = itemValue as Record<string, unknown>;
      const segment = normalizeWatchEpisodeSegment(item.slug);
      const embedUrl = safeWatchEmbedUrl(item.embed);
      if (!segment || !embedUrl) continue;

      const fallbackName = segment === "full"
        ? "FULL"
        : segment.replace("tap-", "Tập ");
      const name = plainText(item.name, 60) ?? fallbackName;

      let episode = episodes.get(segment);
      if (!episode) {
        if (episodes.size >= 1_000) break;
        episode = { name, segment, sources: [] };
        episodes.set(segment, episode);
      }

      const alreadyIncluded = episode.sources.some(source => source.embedUrl === embedUrl);
      if (!alreadyIncluded && episode.sources.length < 24) {
        episode.sources.push({ serverName, embedUrl });
      }
    }
  }

  return [...episodes.values()]
    .sort((left, right) => episodeOrder(left.segment) - episodeOrder(right.segment))
    .map(episode => ({
      name: episode.name,
      segment: episode.segment,
      sourceCount: episode.sources.length,
      sources: episode.sources,
    }));
}

export function normalizeWatchMovie(value: unknown, requestedSlug: string): WatchMovieSummary {
  const root = record(value, "root");
  if (root.status !== "success") throw new WatchApiError("invalid_response", { field: "status" });
  const movie = record(root.movie, "movie");
  const name = plainText(movie.name);
  if (!name || movie.slug !== requestedSlug) {
    throw new WatchApiError("invalid_response", { field: "movie.name/slug" });
  }

  const episodes = playableEpisodes(movie.episodes);

  return {
    id: shortText(movie.id, 100),
    slug: requestedSlug,
    name,
    originalName: plainText(movie.original_name),
    description: plainText(movie.description, 4_000),
    posterUrl: safeWatchImageUrl(movie.poster_url) ?? safeWatchImageUrl(movie.thumb_url),
    thumbUrl: safeWatchImageUrl(movie.thumb_url) ?? safeWatchImageUrl(movie.poster_url),
    quality: plainText(movie.quality, 30),
    language: plainText(movie.language, 50),
    duration: plainText(movie.time, 50),
    currentEpisode: plainText(movie.current_episode, 60),
    totalEpisodes: optionalNonNegativeInteger(movie.total_episodes),
    year: categoryLabels(movie.category, "Năm").find(year => /^\d{4}$/.test(year)) ?? null,
    formats: categoryLabels(movie.category, "Định dạng"),
    genres: categoryLabels(movie.category, "Thể loại"),
    countries: categoryLabels(movie.category, "Quốc gia"),
    director: plainText(movie.director, 500),
    casts: plainText(movie.casts, 800),
    createdAt: optionalDate(movie.created),
    updatedAt: optionalDate(movie.modified),
    trailerUrl: firstTrailerUrl(movie),
    episodes: episodes.map(episode => ({
      name: episode.name,
      segment: episode.segment,
      sourceCount: episode.sourceCount,
    })),
  };
}

/** Player URLs are exposed only to the authorized episode route query. */
export function normalizeWatchPlaybackManifest(
  value: unknown,
  requestedSlug: string,
): WatchPlaybackManifest {
  const root = record(value, "root");
  if (root.status !== "success") {
    throw new WatchApiError("invalid_response", { field: "status" });
  }

  const movie = record(root.movie, "movie");
  const movieName = plainText(movie.name);
  if (!movieName || movie.slug !== requestedSlug) {
    throw new WatchApiError("invalid_response", { field: "movie.name/slug" });
  }

  return {
    movieSlug: requestedSlug,
    movieName,
    originalName: plainText(movie.original_name),
    description: plainText(movie.description, 4_000),
    thumbUrl: safeWatchImageUrl(movie.thumb_url) ?? safeWatchImageUrl(movie.poster_url),
    quality: plainText(movie.quality, 30),
    language: plainText(movie.language, 50),
    duration: plainText(movie.time, 50),
    currentEpisode: plainText(movie.current_episode, 60),
    totalEpisodes: optionalNonNegativeInteger(movie.total_episodes),
    year: categoryLabels(movie.category, "Năm").find(year => /^\d{4}$/.test(year)) ?? null,
    formats: categoryLabels(movie.category, "Định dạng"),
    genres: categoryLabels(movie.category, "Thể loại"),
    countries: categoryLabels(movie.category, "Quốc gia"),
    director: plainText(movie.director, 500),
    casts: plainText(movie.casts, 800),
    createdAt: optionalDate(movie.created),
    updatedAt: optionalDate(movie.modified),
    episodes: playableEpisodes(movie.episodes),
  };
}

function integer(value: unknown, minimum: number, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < minimum) {
    throw new WatchApiError("invalid_response", { field });
  }
  return value;
}

function shortText(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string") return null;
  const text = value.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  return text ? text.slice(0, maxLength) : null;
}

/** Runtime validation follows the supplied documentation; no unchecked JSON cast. */
export function normalizeWatchLatest(value: unknown, requestedPage: number): WatchLatestPage {
  const root = record(value, "root");
  if (root.status !== "success") throw new WatchApiError("invalid_response", { field: "status" });
  const paginate = record(root.paginate, "paginate");
  const pagination = {
    currentPage: integer(paginate.current_page, 1, "paginate.current_page"),
    totalPages: integer(paginate.total_page, 0, "paginate.total_page"),
    totalItems: integer(paginate.total_items, 0, "paginate.total_items"),
    itemsPerPage: integer(paginate.items_per_page, 1, "paginate.items_per_page"),
  };
  if (pagination.currentPage !== requestedPage) {
    throw new WatchApiError("invalid_response", { field: "paginate.current_page" });
  }
  if (!Array.isArray(root.items) || root.items.length > 500
    || root.items.length > pagination.itemsPerPage
    || root.items.length > pagination.totalItems
    || (root.items.length > 0 && pagination.totalPages < pagination.currentPage)) {
    throw new WatchApiError("invalid_response", { field: "items/paginate" });
  }
  const rows = root.items.map((item: unknown) => record(item, "items[]"));
  // Missing optional list metadata never triggers a detail lookup per card.
  return {
    pagination,
    items: rows.map(item => ({
      name: plainText(item.name), slug: shortText(item.slug, 300),
      originalName: plainText(item.original_name),
      thumbUrl: safeWatchImageUrl(item.thumb_url) ?? safeWatchImageUrl(item.poster_url),
      quality: plainText(item.quality, 30), language: plainText(item.language, 50),
      currentEpisode: plainText(item.current_episode, 60),
    })),
    observedItemFields: rows[0]
      ? Object.keys(rows[0]).slice(0, 40).map(key => shortText(key, 80) ?? "")
      : [],
  };
}
