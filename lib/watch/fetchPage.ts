const BASE = "https://ophim1.com/v1/api";

type Type = "the-loai" | "danh-sach" | "quoc-gia";

export async function fetchPageData(
  type: Type,
  slug: string,
  page: number
) {
  const res = await fetch(
    `${BASE}/${type}/${slug}?page=${page}`,
    {
      next: { revalidate: 60 },
    }
  );

  const json = await res.json();

  return {
    items: json?.data?.items || [],
    pagination: json?.data?.params?.pagination,
    title: json?.data?.titlePage || slug,
  };
}