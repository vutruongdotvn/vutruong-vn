import type { Metadata } from "next";
import type { ReactNode } from "react";
import WatchAccessProvider from "@/components/watch/access/WatchAccessProvider";

export const metadata: Metadata = {
  title: "Watch | VT Zone",
  description: "Khu xem phim dành cho tài khoản được cấp quyền trên VT Zone.",
  robots: { index: false, follow: false, noarchive: true, nosnippet: true, noimageindex: true },
};

export default function WatchLayout({ children }: { children: ReactNode }) {
  return <WatchAccessProvider>{children}</WatchAccessProvider>;
}
