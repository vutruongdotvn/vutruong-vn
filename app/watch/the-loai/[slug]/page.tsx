import { notFound } from "next/navigation";
import WatchCollectionBrowser from "@/components/watch/browse/WatchCollectionBrowser";
import { watchGenreItem } from "@/lib/watch/watchDirectory";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function WatchGenrePage({ params }: Props) {
  const { slug } = await params;
  const genre = watchGenreItem(slug);

  // Chỉ cho phép các slug đang xuất hiện trong taxonomy chính thức đã chốt.
  // Không có request phim nào được tạo cho một slug tùy ý/không hợp lệ.
  if (!genre) notFound();

  return (
    <WatchCollectionBrowser
      source={{ kind: "genre", slug: genre.slug }}
      basePath={`/watch/the-loai/${genre.slug}`}
      title={genre.name}
      backHref="/watch/the-loai"
      backLabel="Tất cả thể loại"
    />
  );
}
