import WatchPageLayout from "@/components/watch/WatchPageLayout";

function formatNumber(num: number) {
  return new Intl.NumberFormat("vi-VN").format(num);
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  return {
    title: q ? `Tìm kiếm: ${q}` : "Tìm kiếm",
    robots: { index: false, follow: false },
  };
}

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q, page } = await searchParams;

  const keyword = q || "";
  const currentPage = Number(page) || 1;

  if (!keyword) {
    return (
      <div className="mx-auto max-w-[1200px] py-40 text-center text-white/60">
        Nhập từ khóa để tìm kiếm phim
      </div>
    );
  }

  const res = await fetch(
    `https://ophim1.com/v1/api/tim-kiem?keyword=${keyword}&page=${currentPage}`,
    { next: { revalidate: 30 } }
  );

  const json = await res.json();

  const items = json?.data?.items || [];
  const pagination = json?.data?.params?.pagination;

  const totalItems = pagination?.totalItems || 0;
  const perPage = pagination?.totalItemsPerPage || 24;
  const totalPages = Math.ceil(totalItems / perPage);

  return (
    <WatchPageLayout
      prefix="Tìm kiếm"
      title={keyword}
      items={items}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      baseUrl={`/watch/search?q=${keyword}`}
    />
  );
}