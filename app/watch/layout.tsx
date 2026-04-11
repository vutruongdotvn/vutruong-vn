import type { Metadata } from "next";
import WatchNavbar from "@/components/watch/WatchNavbar";
import WatchFooter from "@/components/watch/WatchFooter";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper"; // ✅ ADD

import {
  getCategories,
  getCountries,
  getListTypes,
} from "@/lib/watch/ophim";

export const metadata: Metadata = {
  title: {
    default: "VT Watch",
    template: "%s",
  },
  description:
    "Xem phim miễn phí - tốc độ cao - không quảng cáo và cập nhật liên tục!",
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
  );
}