import type { WatchCollectionSource } from "@/types/watchApi";

type WatchHomeRow = {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly source: WatchCollectionSource;
};

/** Each row loads page 1 only. Do not use arbitrary URLs or per-card lookups. */
export const WATCH_HOME_ROWS = [
  { id: "watch-latest", title: "Phim mới cập nhật", description: "", source: { kind: "latest" } },
  { id: "watch-airing", title: "Phim đang chiếu", source: { kind: "format", slug: "dang-chieu" } },
  { id: "watch-movies", title: "Phim lẻ", source: { kind: "format", slug: "phim-le" } },
  { id: "watch-series", title: "Phim bộ", source: { kind: "format", slug: "phim-bo" } },
  { id: "watch-vietnam", title: "Phim Việt Nam", source: { kind: "country", slug: "viet-nam" } },
  { id: "watch-korea", title: "Phim Hàn Quốc", source: { kind: "country", slug: "han-quoc" } },
  { id: "watch-china", title: "Phim Trung Quốc", source: { kind: "country", slug: "trung-quoc" } },
  { id: "watch-action", title: "Phim hành động", source: { kind: "genre", slug: "hanh-dong" } },
  { id: "watch-romance", title: "Phim tình cảm", source: { kind: "genre", slug: "tinh-cam" } },
  { id: "watch-horrified", title: "Phim kinh dị", source: { kind: "genre", slug: "kinh-di" } },
] as const satisfies readonly WatchHomeRow[];

type WatchTopicHref =
  | `/watch/the-loai/${string}`
  | `/watch/quoc-gia/${string}`
  | `/watch/danh-sach/${string}`;

type WatchTopicItem = {
  readonly title: string;
  readonly href: WatchTopicHref;
  readonly tone: "pink" | "sage" | "copper" | "rose" | "teal" | "violet" | "blue" | "gold";
  readonly icon: string;
};

/** Editorial shortcuts to real Watch browse routes. No movie data is stored here. */
export const WATCH_TOPICS = [
  { title: "Phim Việt Nam", href: "/watch/quoc-gia/viet-nam", tone: "blue", icon: "fa-star" },
  { title: "Hành động", href: "/watch/the-loai/hanh-dong", tone: "copper", icon: "fa-bolt" },
  { title: "Tình cảm", href: "/watch/the-loai/tinh-cam", tone: "rose", icon: "fa-heart" },
  { title: "Đang chiếu", href: "/watch/danh-sach/dang-chieu", tone: "teal", icon: "fa-clapperboard" },
  { title: "Phim bộ", href: "/watch/danh-sach/phim-bo", tone: "violet", icon: "fa-layer-group" },
  { title: "Phim lẻ", href: "/watch/danh-sach/phim-le", tone: "blue", icon: "fa-film" },
  { title: "TV Shows", href: "/watch/danh-sach/tv-shows", tone: "gold", icon: "fa-tv" },
] as const satisfies readonly WatchTopicItem[];

export const WATCH_TOPIC_INITIAL_COUNT = 5;