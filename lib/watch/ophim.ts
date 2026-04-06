import type {
  OPhimCategory,
  OPhimCategoryResponse,
  OPhimCountry,
  OPhimCountryResponse,
  OPhimDetailResponse,
  OPhimListResponse,
  OPhimListType,
  OPhimMovie,
} from "./types";

const API_BASE = "https://ophim1.com/v1/api";
const FALLBACK_CDN = "https://img.ophim.live/uploads/movies/";

export function stripHtml(html?: string) {
  return html ? html.replace(/<[^>]+>/g, "") : "";
}

export function getMovieImage(path?: string, base = FALLBACK_CDN) {
  if (!path || typeof path !== "string") {
    return "https://placehold.co/1280x720?text=No+Image";
  }
  return path.startsWith("http") ? path : `${base}${path}`;
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 1800 },
      headers: { accept: "application/json" },
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getHomeMovies() {
  const data = await fetchJson<OPhimListResponse>(`${API_BASE}/home`);
  const items = data?.data?.items ?? [];
  const cdn = `${data?.data?.APP_DOMAIN_CDN_IMAGE || "https://img.ophim.live"}/uploads/movies/`;

  return {
    items,
    cdn,
  };
}

export async function getMovieDetail(slug: string) {
  return fetchJson<OPhimDetailResponse>(`${API_BASE}/phim/${slug}`);
}

export async function getHeroMovies() {
  const { items, cdn } = await getHomeMovies();
  const newestItems = items.slice(0, 10);

  const detailResults = await Promise.all(
    newestItems.map((item) => getMovieDetail(item.slug))
  );

  const enriched = newestItems.map((item, idx) => {
    const detail = detailResults[idx]?.data?.item || {};
    const detailCdn = `${detailResults[idx]?.data?.APP_DOMAIN_CDN_IMAGE || "https://img.ophim.live"}/uploads/movies/`;

    return {
      ...item,
      ...detail,
      _bgUrl: getMovieImage(
        detail.poster_url ||
          detail.thumb_url ||
          item.poster_url ||
          item.thumb_url,
        detailCdn
      ),
      _thumbUrl: getMovieImage(item.thumb_url || item.poster_url, cdn),
    } as OPhimMovie & {
      _bgUrl: string;
      _thumbUrl: string;
    };
  });

  return enriched;
}

export async function getSectionMovies(apiPath: string) {
  const data = await fetchJson<OPhimListResponse>(`${API_BASE}${apiPath}?page=1`);
  return data?.data?.items ?? [];
}

/**
 * Dynamic navbar data
 */
export async function getCategories(): Promise<OPhimCategory[]> {
  const data = await fetchJson<any>(`${API_BASE}/the-loai`);

  const rawItems =
    data?.items ||
    data?.data?.items ||
    data?.data ||
    [];

  if (!Array.isArray(rawItems)) return [];

  return rawItems
    .map((item: any) => ({
      id: item?._id || item?.id || item?.slug,
      name: item?.name || "",
      slug: item?.slug || "",
    }))
    .filter((item: OPhimCategory) => item.name && item.slug);
}

export async function getCountries(): Promise<OPhimCountry[]> {
  const data = await fetchJson<any>(`${API_BASE}/quoc-gia`);

  const rawItems =
    data?.items ||
    data?.data?.items ||
    data?.data ||
    [];

  if (!Array.isArray(rawItems)) return [];

  return rawItems
    .map((item: any) => ({
      id: item?._id || item?.id || item?.slug,
      name: item?.name || "",
      slug: item?.slug || "",
    }))
    .filter((item: OPhimCountry) => item.name && item.slug);
}

/**
 * OPhim không có endpoint "danh-sach" menu động chuẩn như category/country,
 * nên đây là danh sách chuẩn hóa theo hệ route thật của OPhim.
 * Vẫn là "dynamic config", không hard-code ở component UI.
 */
export async function getListTypes(): Promise<OPhimListType[]> {
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