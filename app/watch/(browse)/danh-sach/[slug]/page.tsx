import WatchPageLayout from "@/components/watch/WatchPageLayout";
import { fetchPageData } from "@/lib/watch/fetchPage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const data = await fetchPageData("danh-sach", slug, 1);

  return {
    title: `Danh sách: ${data.title}`,
    robots: { index: false, follow: false },
  };
}

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { slug } = await params;
  const { page } = await searchParams;

  const currentPage = Number(page) || 1;

  const data = await fetchPageData(
    "danh-sach",
    slug,
    currentPage
  );

  const totalItems = data.pagination?.totalItems || 0;
  const perPage = data.pagination?.totalItemsPerPage || 24;
  const totalPages = Math.ceil(totalItems / perPage);

  return (
    <WatchPageLayout
      prefix="Danh sách"
      title={data.title}
      items={data.items}
      currentPage={currentPage}
      totalPages={totalPages}
      totalItems={totalItems}
      baseUrl={`/watch/danh-sach/${slug}`}
    />
  );
}