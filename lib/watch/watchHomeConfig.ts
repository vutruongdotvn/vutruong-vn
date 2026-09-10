import type { WatchCollectionSource } from "@/types/watchApi";

type WatchHomeRow = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly source: WatchCollectionSource;
};

/** Each row loads page 1 only. Do not use arbitrary URLs or per-card lookups. */
export const WATCH_HOME_ROWS = [
  { id: "watch-latest", title: "Phim mới", description: "Phim mới được cập nhật", source: { kind: "latest" } },
  { id: "watch-airing", title: "Phim đang chiếu", source: { kind: "format", slug: "dang-chieu" } },
  { id: "watch-movies", title: "Phim lẻ", source: { kind: "format", slug: "phim-le" } },
  { id: "watch-series", title: "Phim bộ", source: { kind: "format", slug: "phim-bo" } },
  { id: "watch-vietnam", title: "Phim Việt Nam", source: { kind: "country", slug: "viet-nam" } },
  { id: "watch-korea", title: "Phim Hàn Quốc", source: { kind: "country", slug: "han-quoc" } },
  { id: "watch-china", title: "Phim Trung Quốc", source: { kind: "country", slug: "trung-quoc" } },
  { id: "watch-action", title: "Hành động", source: { kind: "genre", slug: "hanh-dong" } },
  { id: "watch-romance", title: "Tình cảm", source: { kind: "genre", slug: "tinh-cam" } },
] as const satisfies readonly WatchHomeRow[];

type WatchTopicItem = {
  readonly title: string;
  readonly target: (typeof WATCH_HOME_ROWS)[number]["id"];
  readonly tone: "pink" | "sage" | "copper" | "rose" | "teal" | "violet" | "blue" | "gold";
  readonly icon: string;
};

/** Editorial shortcuts, not API-provided popularity rankings. No movie data stored here. */
export const WATCH_TOPICS = [
  { title: "Phim Việt Nam", target: "watch-vietnam", tone: "blue", icon: "fa-sparkles" },
  { title: "Hành động", target: "watch-action", tone: "copper", icon: "fa-bolt" },
  { title: "Tình cảm", target: "watch-romance", tone: "rose", icon: "fa-heart" },
  { title: "Đang chiếu", target: "watch-airing", tone: "teal", icon: "fa-clapperboard" },
  { title: "Phim bộ", target: "watch-series", tone: "violet", icon: "fa-layer-group" },
  { title: "Phim lẻ", target: "watch-movies", tone: "blue", icon: "fa-film" },
  { title: "Mới cập nhật", target: "watch-latest", tone: "gold", icon: "fa-clock-rotate-left" },
] as const satisfies readonly WatchTopicItem[];

export const WATCH_TOPIC_INITIAL_COUNT = 5;
