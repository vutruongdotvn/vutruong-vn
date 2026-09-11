import WatchDirectoryIndex from "@/components/watch/browse/WatchDirectoryIndex";
import { WATCH_COUNTRIES } from "@/lib/watch/watchDirectory";

export default function WatchCountryIndexPage() {
  return (
    <WatchDirectoryIndex
      title="Quốc gia & khu vực"
      description="Danh sách quốc gia và khu vực theo menu NguồnC đã đối chiếu. Mỗi mục mở một danh sách phim phân trang độc lập."
      basePath="/watch/quoc-gia"
      cardAction="Xem quốc gia"
      items={WATCH_COUNTRIES}
    />
  );
}
