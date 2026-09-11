import WatchDirectoryIndex from "@/components/watch/browse/WatchDirectoryIndex";
import { WATCH_LISTS } from "@/lib/watch/watchDirectory";

export default function WatchListIndexPage() {
  return (
    <WatchDirectoryIndex
      title="Danh sách phim"
      description="Các nhóm danh sách chính đang được NguồnC sử dụng. Mỗi mục dùng chung grid và phân trang nhẹ của VT Watch."
      basePath="/watch/danh-sach"
      cardAction="Mở danh sách"
      items={WATCH_LISTS}
    />
  );
}
