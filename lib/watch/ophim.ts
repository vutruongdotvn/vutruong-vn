import type {
  OPhimCategory,
  OPhimCountry,
  OPhimDetailResponse,
  OPhimListResponse,
  OPhimListType,
  OPhimMovie,
} from "./types";

const API_BASE = "https://ophim1.com/v1/api";
const FALLBACK_CDN = "https://img.ophim.live/uploads/movies/";

/**
 * Utils
 */
export function stripHtml(html?: string) {
  return html ? html.replace(/<[^>]+>/g, "").trim() : "";
}

export function getMovieImage(path?: string, base = FALLBACK_CDN) {
  if (!path || typeof path !== "string") {
    return "/watch/og.png"; // ✅ fallback chuẩn branding
  }

  return path.startsWith("http") ? path : `${base}${path}`;
}

/**
 * Base fetch (ISR ready)
 */
async function fetchJson<T>(url: string, revalidate = 1800): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate },
      headers: { accept: "application/json" },
    });

    if (!res.ok) return null;

    return (await res.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Home
 */
export async function getHomeMovies(): Promise<{
  items: OPhimMovie[];
  cdn: string;
}> {
  const data = await fetchJson<OPhimListResponse>(`${API_BASE}/home`);

  const items = Array.isArray(data?.data?.items) ? data.data.items : [];

  const cdn = `${
    data?.data?.APP_DOMAIN_CDN_IMAGE || "https://img.ophim.live"
  }/uploads/movies/`;

  return { items, cdn };
}

/**
 * Detail (MAIN API)
 */
export async function getOPhimMovieDetail(slug: string) {
  const url = `${API_BASE}/phim/${slug}`;
  const raw = await fetchJson<any>(url);

  if (!raw) return null;

  if (process.env.NODE_ENV === "development") {
    console.log("[VT Watch] DETAIL:", {
      slug,
      hasItem: !!raw?.data?.item,
    });
  }

  const movie = raw?.data?.item ?? null;
  const episodes = raw?.data?.item?.episodes ?? [];
  const seoOnPage = raw?.data?.seoOnPage ?? null;
  const breadCrumb = raw?.data?.breadCrumb ?? [];

  const cdnBase =
    raw?.data?.APP_DOMAIN_CDN_IMAGE || "https://img.ophim.live";

  if (!movie) return null;

  return {
    movie,
    episodes: Array.isArray(episodes) ? episodes : [],
    seoOnPage,
    breadCrumb,
    cdn: `${cdnBase}/uploads/movies/`,
  };
}

/**
 * Sections
 */
export async function getSectionMovies(
  apiPath: string
): Promise<OPhimMovie[]> {
  const data = await fetchJson<OPhimListResponse>(
    `${API_BASE}${apiPath}?page=1`
  );

  return Array.isArray(data?.data?.items) ? data.data.items : [];
}

/**
 * Hero (optimized: tránh gọi quá nhiều API detail)
 */
export async function getHeroMovies(): Promise<
  (OPhimMovie & {
    _bgUrl: string;
    _thumbUrl: string;
  })[]
> {
  const { items, cdn } = await getHomeMovies();

  const sliced = items.slice(0, 6); // ✅ giảm load

  return sliced.map((item) => ({
    ...item,
    _bgUrl: getMovieImage(
      item.poster_url || item.thumb_url,
      cdn
    ),
    _thumbUrl: getMovieImage(
      item.thumb_url || item.poster_url,
      cdn
    ),
  }));
}

/**
 * Navbar data
 */
function normalizeList<T extends { _id?: string; id?: string; slug?: string; name?: string }>(
  rawItems: unknown[]
): T[] {
  return rawItems
    .map((item) => {
      const obj = item as T;

      return {
        id: obj._id || obj.id || obj.slug || "",
        name: obj.name || "",
        slug: obj.slug || "",
      };
    })
    .filter((item) => item.name && item.slug) as T[];
}

export async function getCategories(): Promise<OPhimCategory[]> {
  const data = await fetchJson<any>(`${API_BASE}/the-loai`);

  const rawItems =
    data?.items ||
    data?.data?.items ||
    data?.data ||
    [];

  if (!Array.isArray(rawItems)) return [];

  return normalizeList<OPhimCategory>(rawItems);
}

export async function getCountries(): Promise<OPhimCountry[]> {
  const data = await fetchJson<any>(`${API_BASE}/quoc-gia`);

  const rawItems =
    data?.items ||
    data?.data?.items ||
    data?.data ||
    [];

  if (!Array.isArray(rawItems)) return [];

  return normalizeList<OPhimCountry>(rawItems);
}

/**
 * List types (static config)
 */
export function getListTypes(): OPhimListType[] {
  return [
    { name: "Phim Mới Cập Nhật", slug: "phim-moi-cap-nhat" },
    { name: "Phim Bộ", slug: "phim-bo" },
    { name: "Phim Lẻ", slug: "phim-le" },
    { name: "TV Shows", slug: "tv-shows" },
    { name: "Hoạt Hình", slug: "hoat-hinh" },
    { name: "Phim Vietsub", slug: "phim-vietsub" },
    { name: "Phim Thuyết Minh", slug: "phim-thuyet-minh" },
    { name: "Phim Lồng Tiếng", slug: "phim-long-tieng" },
    { name: "Phim Chiếu Rạp", slug: "phim-chieu-rap" },
  ];
}

/**
 * Peoples (cast)
 */
export async function getOPhimPeoples(slug: string) {
  const url = `${API_BASE}/phim/${slug}/peoples`;

  const json = await fetchJson<any>(url, 3600);

  if (!json) return [];

  const peoples = json?.data?.peoples ?? [];
  const base = json?.data?.profile_sizes?.w185 ?? "";

  return peoples.map((p: any) => ({
    name: p.name,
    thumb_url: p.profile_path ? `${base}${p.profile_path}` : null,
    character: p.character,
    known_for_department: p.known_for_department,
  }));
}