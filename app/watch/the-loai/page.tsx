import WatchDirectoryIndex from "@/components/watch/browse/WatchDirectoryIndex";
import { WATCH_GENRES } from "@/lib/watch/watchDirectory";

export default function WatchGenreIndexPage() {
  return (
    <WatchDirectoryIndex
      title="Thể loại phim"
      description="Toàn bộ thể loại hiện có trên NguồnC. Mỗi thẻ dẫn tới một danh sách phim phân trang độc lập."
      basePath="/watch/the-loai"
      cardAction="Xem thể loại"
      items={WATCH_GENRES}
    />
  );
}
