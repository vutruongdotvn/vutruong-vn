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

    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getHomeMovies(): Promise<{
  items: OPhimMovie[];
  cdn: string;
}> {
  const data = await fetchJson<OPhimListResponse>(`${API_BASE}/home`);

  const items = Array.isArray(data?.data?.items) ? data.data.items : [];
  const cdn = `${
    data?.data?.APP_DOMAIN_CDN_IMAGE || "https://img.ophim.live"
  }/uploads/movies/`;

  return {
    items,
    cdn,
  };
}

export async function getMovieDetail(
  slug: string
): Promise<OPhimDetailResponse | null> {
  return fetchJson<OPhimDetailResponse>(`${API_BASE}/phim/${slug}`);
}

export async function getHeroMovies(): Promise<
  (OPhimMovie & {
    _bgUrl: string;
    _thumbUrl: string;
  })[]
> {
  const { items, cdn } = await getHomeMovies();
  const newestItems = items.slice(0, 10);

  const detailResults = await Promise.all(
    newestItems.map((item) => getMovieDetail(item.slug))
  );

  const enriched = newestItems.map((item, idx) => {
    const detail = detailResults[idx]?.data?.item ?? null;

    const detailCdn = `${
      detailResults[idx]?.data?.APP_DOMAIN_CDN_IMAGE || "https://img.ophim.live"
    }/uploads/movies/`;

    return {
      ...item,
      ...(detail ?? {}),
      _bgUrl: getMovieImage(
        detail?.poster_url ||
          detail?.thumb_url ||
          item.poster_url ||
          item.thumb_url,
        detailCdn
      ),
      _thumbUrl: getMovieImage(item.thumb_url || item.poster_url, cdn),
    };
  });

  return enriched;
}

export async function getSectionMovies(apiPath: string): Promise<OPhimMovie[]> {
  const data = await fetchJson<OPhimListResponse>(
    `${API_BASE}${apiPath}?page=1`
  );

  return Array.isArray(data?.data?.items) ? data.data.items : [];
}

/**
 * Dynamic navbar data
 */
export async function getCategories(): Promise<OPhimCategory[]> {
  const data = await fetchJson<unknown>(`${API_BASE}/the-loai`);

  const rawItems =
    (data as { items?: unknown[] })?.items ||
    (data as { data?: { items?: unknown[] } })?.data?.items ||
    (data as { data?: unknown[] })?.data ||
    [];

  if (!Array.isArray(rawItems)) return [];

  return rawItems
    .map((item) => {
      const obj = item as {
        _id?: string;
        id?: string;
        slug?: string;
        name?: string;
      };

      return {
        id: obj._id || obj.id || obj.slug || "",
        name: obj.name || "",
        slug: obj.slug || "",
      };
    })
    .filter((item) => item.name && item.slug);
}

export async function getCountries(): Promise<OPhimCountry[]> {
  const data = await fetchJson<unknown>(`${API_BASE}/quoc-gia`);

  const rawItems =
    (data as { items?: unknown[] })?.items ||
    (data as { data?: { items?: unknown[] } })?.data?.items ||
    (data as { data?: unknown[] })?.data ||
    [];

  if (!Array.isArray(rawItems)) return [];

  return rawItems
    .map((item) => {
      const obj = item as {
        _id?: string;
        id?: string;
        slug?: string;
        name?: string;
      };

      return {
        id: obj._id || obj.id || obj.slug || "",
        name: obj.name || "",
        slug: obj.slug || "",
      };
    })
    .filter((item) => item.name && item.slug);
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


export async function getOPhimMovieDetail(slug: string) {
  const url = `${API_BASE}/phim/${slug}`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 1800 },
      headers: { accept: "application/json" },
    });

    if (!res.ok) {
      console.error("[VT Watch] Detail fetch failed:", {
        slug,
        url,
        status: res.status,
        statusText: res.statusText,
      });
      return null;
    }

    const raw = await res.json();

    console.log("[VT Watch] RAW DETAIL RESPONSE:", {
      slug,
      url,
      topLevelKeys: Object.keys(raw || {}),
      dataKeys: Object.keys(raw?.data || {}),
      itemKeys: Object.keys(raw?.data?.item || {}),
      hasItem: !!raw?.data?.item,
      hasEpisodesInItem: Array.isArray(raw?.data?.item?.episodes),
      rawPreview: {
        status: raw?.status,
        msg: raw?.msg,
        movieName: raw?.data?.item?.name || null,
      },
    });

    const movie = raw?.data?.item ?? null;
    const episodes = raw?.data?.item?.episodes ?? [];
    const seoOnPage = raw?.data?.seoOnPage ?? null;
    const breadCrumb = raw?.data?.breadCrumb ?? [];
    const cdnBase =
      raw?.data?.APP_DOMAIN_CDN_IMAGE || "https://img.ophim.live";

    if (!movie) {
      console.error("[VT Watch] No movie parsed from detail response:", {
        slug,
        url,
      });
      return null;
    }

    return {
      movie,
      episodes: Array.isArray(episodes) ? episodes : [],
      seoOnPage,
      breadCrumb,
      cdn: `${cdnBase}/uploads/movies/`,
    };
  } catch (error) {
    console.error("[VT Watch] Detail fetch exception:", {
      slug,
      url,
      error,
    });
    return null;
  }
}