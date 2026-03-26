// lib/phim/ophim.ts

const OPHIM_CDN = "https://img.ophim.live/uploads/movies";

export function normalizeImageUrl(url?: string | null) {
  if (!url) return "/images/no-poster.png";

  // Nếu đã là URL đầy đủ
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  // Nếu là đường dẫn local kiểu /abc.jpg
  if (url.startsWith("/")) {
    return url;
  }

  // Nếu API trả về tên file kiểu: dac-vu-bi-mat-poster.jpg
  return `${OPHIM_CDN}/${url}`;
}

export async function getMovieDetail(slug: string) {
  const res = await fetch(`https://ophim1.com/phim/${slug}`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data;
}

export async function getCategoryPage(type: string, slug: string, page = 1) {
  const res = await fetch(
    `https://ophim1.com/v1/api/danh-sach/${slug}?page=${page}`,
    {
      next: { revalidate: 3600 },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data;
}

export async function searchMovies(keyword: string, page = 1) {
  const encoded = encodeURIComponent(keyword);

  const res = await fetch(
    `https://ophim1.com/v1/api/tim-kiem?keyword=${encoded}&page=${page}`,
    {
      next: { revalidate: 1800 },
    }
  );

  if (!res.ok) return null;

  const data = await res.json();
  return data;
}