import { waitForWatchOperation } from "./watchAccessController";
import type { WatchAccessPermit } from "../../types/watchAccess";
import { WatchApiError, type WatchCollectionSource } from "../../types/watchApi";

export type WatchDirectoryKind = "genre" | "country" | "format";

export type WatchCountryFlagCode =
  | "gb" | "cn" | "id" | "vn" | "fr" | "hk" | "kr"
  | "jp" | "th" | "tw" | "ru" | "nl" | "ph" | "in";

export type WatchDirectoryItem = {
  readonly name: string;
  readonly slug: string;
  readonly icon?: string;
  readonly flag?: WatchCountryFlagCode;
  readonly color?: string;
};

export type WatchListDirectoryItem = WatchDirectoryItem & {
  readonly source: WatchCollectionSource;
};

export type WatchDirectoryData = {
  readonly kind: WatchDirectoryKind;
  readonly items: ReadonlyArray<WatchDirectoryItem>;
};

type WatchDirectoryIdentity = Pick<WatchAccessPermit, "userId" | "accessKind" | "revision">;

/**
 * Danh sách thể loại được chốt theo dropdown hiện tại của nguonc.com.
 * /watch/the-loai không gọi một endpoint taxonomy riêng vì NguồnC hiện không
 * cung cấp /api/the-loai (endpoint đó trả 404). Các trang [slug] vẫn gọi đúng
 * endpoint phim phân trang /api/films/the-loai/{slug}?page={page}.
 */
export const WATCH_GENRES = Object.freeze([
  { name: "Hành Động", slug: "hanh-dong", icon: "fa-bolt", color: "hsl(7 58% 58%)" },
  { name: "Phiêu Lưu", slug: "phieu-luu", icon: "fa-compass", color: "hsl(28 58% 56%)" },
  { name: "Hoạt Hình", slug: "hoat-hinh", icon: "fa-wand-magic-sparkles", color: "hsl(278 48% 62%)" },
  { name: "Hài", slug: "hai", icon: "fa-face-laugh-beam", color: "hsl(48 58% 55%)" },
  { name: "Hình Sự", slug: "hinh-su", icon: "fa-user-secret", color: "hsl(211 44% 58%)" },
  { name: "Tài Liệu", slug: "tai-lieu", icon: "fa-file-lines", color: "hsl(166 42% 52%)" },
  { name: "Chính Kịch", slug: "chinh-kich", icon: "fa-masks-theater", color: "hsl(344 46% 60%)" },
  { name: "Gia Đình", slug: "gia-dinh", icon: "fa-house-heart", color: "hsl(108 36% 54%)" },
  { name: "Giả Tưởng", slug: "gia-tuong", icon: "fa-sparkles", color: "hsl(263 44% 62%)" },
  { name: "Lịch Sử", slug: "lich-su", icon: "fa-landmark", color: "hsl(24 46% 55%)" },
  { name: "Kinh Dị", slug: "kinh-di", icon: "fa-ghost", color: "hsl(353 48% 55%)" },
  { name: "Nhạc", slug: "nhac", icon: "fa-music", color: "hsl(310 42% 60%)" },
  { name: "Bí Ẩn", slug: "bi-an", icon: "fa-magnifying-glass", color: "hsl(226 42% 59%)" },
  { name: "Lãng Mạn", slug: "lang-man", icon: "fa-heart", color: "hsl(333 52% 63%)" },
  { name: "Khoa Học Viễn Tưởng", slug: "khoa-hoc-vien-tuong", icon: "fa-user-astronaut", color: "hsl(194 48% 54%)" },
  { name: "Gây Cấn", slug: "gay-can", icon: "fa-crosshairs", color: "hsl(2 50% 52%)" },
  { name: "Chiến Tranh", slug: "chien-tranh", icon: "fa-shield-halved", color: "hsl(17 43% 50%)" },
  { name: "Tâm Lý", slug: "tam-ly", icon: "fa-brain", color: "hsl(249 39% 63%)" },
  { name: "Tình Cảm", slug: "tinh-cam", icon: "fa-heart-circle", color: "hsl(322 46% 61%)" },
  { name: "Cổ Trang", slug: "co-trang", icon: "fa-landmark-dome", color: "hsl(40 48% 55%)" },
  { name: "Miền Tây", slug: "mien-tay", icon: "fa-hat-cowboy", color: "hsl(31 42% 49%)" },
  { name: "Phim 18+", slug: "phim-18", icon: "fa-lock", color: "hsl(358 39% 49%)" },
] as const satisfies readonly WatchDirectoryItem[]);

/**
 * Quốc gia/khu vực được chốt theo dropdown NguồnC mà chủ site đã đối chiếu.
 * Cờ được render nội bộ bằng SVG JSX; không tải flag CDN/asset bên thứ ba.
 * Âu Mỹ và Quốc gia khác là vùng/tập hợp nên dùng icon địa lý thay vì giả một cờ.
 */
export const WATCH_COUNTRIES = Object.freeze([
  { name: "Âu Mỹ", slug: "au-my", icon: "fa-earth-americas", color: "hsl(211 48% 57%)" },
  { name: "Anh", slug: "anh", flag: "gb", color: "hsl(225 44% 57%)" },
  { name: "Trung Quốc", slug: "trung-quoc", flag: "cn", color: "hsl(2 54% 55%)" },
  { name: "Indonesia", slug: "indonesia", flag: "id", color: "hsl(353 49% 59%)" },
  { name: "Việt Nam", slug: "viet-nam", flag: "vn", color: "hsl(8 58% 56%)" },
  { name: "Pháp", slug: "phap", flag: "fr", color: "hsl(220 43% 60%)" },
  { name: "Hồng Kông", slug: "hong-kong", flag: "hk", color: "hsl(346 49% 57%)" },
  { name: "Hàn Quốc", slug: "han-quoc", flag: "kr", color: "hsl(205 40% 60%)" },
  { name: "Nhật Bản", slug: "nhat-ban", flag: "jp", color: "hsl(340 43% 63%)" },
  { name: "Thái Lan", slug: "thai-lan", flag: "th", color: "hsl(245 40% 60%)" },
  { name: "Đài Loan", slug: "dai-loan", flag: "tw", color: "hsl(229 44% 56%)" },
  { name: "Nga", slug: "nga", flag: "ru", color: "hsl(215 35% 62%)" },
  { name: "Hà Lan", slug: "ha-lan", flag: "nl", color: "hsl(18 52% 58%)" },
  { name: "Philippines", slug: "philippines", flag: "ph", color: "hsl(199 48% 55%)" },
  { name: "Ấn Độ", slug: "an-do", flag: "in", color: "hsl(31 55% 55%)" },
  { name: "Quốc gia khác", slug: "quoc-gia-khac", icon: "fa-earth-asia", color: "hsl(167 39% 53%)" },
] as const satisfies readonly WatchDirectoryItem[]);

/**
 * Bốn card chính bám đúng menu danh sách chính thức đang dùng.
 * "Phim mới cập nhật" vẫn có route hợp lệ bên dưới để khớp watchCollectionHref()
 * và hàng Phim mới ở homepage, nhưng không được thêm vào index này như một mục menu giả.
 */
export const WATCH_LISTS = Object.freeze([
  {
    name: "TV Shows",
    slug: "tv-shows",
    icon: "fa-tv",
    color: "hsl(260 44% 61%)",
    source: { kind: "format", slug: "tv-shows" },
  },
  {
    name: "Phim lẻ",
    slug: "phim-le",
    icon: "fa-film",
    color: "hsl(204 47% 57%)",
    source: { kind: "format", slug: "phim-le" },
  },
  {
    name: "Phim bộ",
    slug: "phim-bo",
    icon: "fa-layer-group",
    color: "hsl(286 40% 61%)",
    source: { kind: "format", slug: "phim-bo" },
  },
  {
    name: "Đang chiếu",
    slug: "dang-chieu",
    icon: "fa-clapperboard-play",
    color: "hsl(164 43% 51%)",
    source: { kind: "format", slug: "dang-chieu" },
  },
] as const satisfies readonly WatchListDirectoryItem[]);

const WATCH_LATEST_LIST = Object.freeze({
  name: "Phim mới cập nhật",
  slug: "phim-moi-cap-nhat",
  icon: "fa-clock-rotate-left",
  color: "hsl(43 50% 55%)",
  source: { kind: "latest" },
} as const satisfies WatchListDirectoryItem);

const GENRE_BY_SLUG = new Map<string, WatchDirectoryItem>(
  WATCH_GENRES.map(item => [item.slug, item]),
);
const COUNTRY_BY_SLUG = new Map<string, WatchDirectoryItem>(
  WATCH_COUNTRIES.map(item => [item.slug, item]),
);
const LIST_BY_SLUG = new Map<string, WatchListDirectoryItem>(
  [...WATCH_LISTS, WATCH_LATEST_LIST].map(item => [item.slug, item]),
);

export function watchGenreItem(slug: unknown): WatchDirectoryItem | null {
  return typeof slug === "string" ? GENRE_BY_SLUG.get(slug) ?? null : null;
}

export function watchCountryItem(slug: unknown): WatchDirectoryItem | null {
  return typeof slug === "string" ? COUNTRY_BY_SLUG.get(slug) ?? null : null;
}

export function watchListItem(slug: unknown): WatchListDirectoryItem | null {
  return typeof slug === "string" ? LIST_BY_SLUG.get(slug) ?? null : null;
}

export function watchGenreFallbackName(slug: string): string {
  const known = watchGenreItem(slug);
  if (known) return known.name;

  return slug
    .split("-")
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function watchGenreIcon(slug: string): string {
  return watchGenreItem(slug)?.icon ?? "fa-clapperboard-play";
}

/**
 * Compatibility shim for the earlier D2 hook. Static taxonomy pages consume the
 * arrays above synchronously and therefore create zero taxonomy-network requests.
 * The permission verification is retained here only so an older caller cannot
 * turn this compatibility API into a pre-guard data source.
 */
export async function fetchWatchDirectory(
  kind: WatchDirectoryKind,
  identity: WatchDirectoryIdentity,
  requireAccess: () => Promise<WatchAccessPermit>,
  consumerSignal: AbortSignal,
): Promise<WatchDirectoryData> {
  if (typeof window === "undefined") throw new WatchApiError("browser_only");
  if (consumerSignal.aborted) throw new WatchApiError("cancelled");

  const permit = await waitForWatchOperation(requireAccess(), consumerSignal);
  if (
    consumerSignal.aborted
    || !permit
    || permit.userId !== identity.userId
    || permit.accessKind !== identity.accessKind
    || permit.revision !== identity.revision
    || !permit.signal
    || permit.signal.aborted
  ) {
    throw new WatchApiError("access_denied");
  }

  return Object.freeze({
    kind,
    items: kind === "genre"
      ? WATCH_GENRES
      : kind === "country"
        ? WATCH_COUNTRIES
        : WATCH_LISTS,
  });
}
