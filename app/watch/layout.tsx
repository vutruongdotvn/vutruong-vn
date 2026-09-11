import type { Metadata } from "next";
import type { ReactNode } from "react";
import WatchAccessProvider from "@/components/watch/access/WatchAccessProvider";
import WatchGuard from "@/components/watch/access/WatchGuard";
import WatchQueryProvider from "@/components/watch/WatchQueryProvider";

const WATCH_DESCRIPTION =
  "Xem phim giải trí, miễn phí, không quảng cáo, tốc độ cao và cập nhật liên tục.";

export const metadata: Metadata = {
  title: "Watch",
  description: WATCH_DESCRIPTION,
  openGraph: {
    title: "Watch",
    description: WATCH_DESCRIPTION,
    images: ["/images/og-watch.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Watch",
    description: WATCH_DESCRIPTION,
    images: ["/images/og-watch.png"],
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
    googleBot: {
      index: false,
      follow: false,
      noarchive: true,
      nosnippet: true,
      noimageindex: true,
    },
  },
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
