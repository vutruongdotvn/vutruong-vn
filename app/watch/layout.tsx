import type { Metadata } from "next";
import type { ReactNode } from "react";
import WatchAccessProvider from "@/components/watch/access/WatchAccessProvider";
import WatchGuard from "@/components/watch/access/WatchGuard";
import WatchQueryProvider from "@/components/watch/WatchQueryProvider";

export const metadata: Metadata = {
  title: "Watch",
  description: "Khu vực giải trí nội bộ | Xem phim miễn phí - không quảng cáo và cập nhật liên tục.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true, noimageindex: true },
};

export default function WatchLayout({ children }: { children: ReactNode }) {
  return (
    <WatchAccessProvider>
      <WatchGuard>
        <WatchQueryProvider>{children}</WatchQueryProvider>
      </WatchGuard>
    </WatchAccessProvider>
  );
}
