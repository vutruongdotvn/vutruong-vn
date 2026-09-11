import { notFound } from "next/navigation";
import WatchCollectionBrowser from "@/components/watch/browse/WatchCollectionBrowser";
import { watchListItem } from "@/lib/watch/watchDirectory";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function WatchListPage({ params }: Props) {
  const { slug } = await params;
  const list = watchListItem(slug);

  // Chỉ cho phép các route danh sách đã cấu hình. Bao gồm phim-moi-cap-nhat
  // để khớp link "Xem tất cả" hiện có của hàng Mới cập nhật trên homepage.
  if (!list) notFound();

  return (
    <WatchCollectionBrowser
      source={list.source}
      basePath={`/watch/danh-sach/${list.slug}`}
      title={list.name}
      backHref="/watch/danh-sach"
      backLabel="Tất cả danh sách"
    />
  );
}
