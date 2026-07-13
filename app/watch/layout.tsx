import type { Metadata } from "next";
import WatchNavbar from "@/components/watch/WatchNavbar";
import WatchFooter from "@/components/watch/WatchFooter";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper"; // ✅ ADD
export const revalidate = 86400; // cache 1d
import WatchGuard from "@/components/watch/WatchGuard"; // ✅ 1. Import Guard

import {
  getCategories,
  getCountries,
  getListTypes,
} from "@/lib/watch/ophim";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vutruong.vn"),

  title: {
    default: "VT Watch",
    template: "%s | VT Watch",
  },

  description:
    "Xem phim miễn phí, tốc độ cao, không quảng cáo và cập nhật liên tục.",

  openGraph: {
    title: "VT Watch",
    description:
      "Xem phim miễn phí, tốc độ cao, không quảng cáo và cập nhật liên tục.",
    url: "/watch",
    siteName: "VT Watch",
    images: [
      {
        url: "/watch-og.png",
        width: 1200,
        height: 630,
        alt: "VT Watch",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "VT Watch",
    description:
      "Xem phim miễn phí, tốc độ cao, không quảng cáo và cập nhật liên tục.",
    images: ["/watch-og.png"],
  },

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

export default async function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [categories, countries, listTypes] = await Promise.all([
    getCategories(),
    getCountries(),
    getListTypes(),
  ]);

  return (
    <WatchGuard>
      <div className="bg-black text-white">
        {/* ✅ GLOBAL FANCYBOX */}
        <FancyboxWrapper />

        <WatchNavbar
          categories={categories}
          countries={countries}
          listTypes={listTypes}
        />

        {children}

        <WatchFooter />
      </div>
    </WatchGuard>
  );
}