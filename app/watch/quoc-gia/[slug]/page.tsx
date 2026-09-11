import { notFound } from "next/navigation";
import WatchCollectionBrowser from "@/components/watch/browse/WatchCollectionBrowser";
import { watchCountryItem } from "@/lib/watch/watchDirectory";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function WatchCountryPage({ params }: Props) {
  const { slug } = await params;
  const country = watchCountryItem(slug);

  // Chỉ cho phép slug nằm trong taxonomy quốc gia/khu vực đã chốt.
  // Slug tùy ý bị 404 trước khi browser có cơ hội tạo request phim.
  if (!country) notFound();

  return (
    <WatchCollectionBrowser
      source={{ kind: "country", slug: country.slug }}
      basePath={`/watch/quoc-gia/${country.slug}`}
      title={country.name}
      backHref="/watch/quoc-gia"
      backLabel="Tất cả quốc gia"
    />
  );
}
