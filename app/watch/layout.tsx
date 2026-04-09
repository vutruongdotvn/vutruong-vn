import type { Metadata } from "next";
import WatchNavbar from "@/components/watch/WatchNavbar";
import {
  getCategories,
  getCountries,
  getListTypes,
} from "@/lib/watch/ophim";

export const metadata: Metadata = {
  title: {
    default: "VT Watch",
    template: "%s | VT Watch",
  },
  description:
    "Xem phim miễn phí - tốc độ cao - không quảng cáo và cập nhật liên tục!",
  robots: {
    index: false,
    follow: false,
    nocache: true,
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
    <div className="VT_Watch_app min-h-screen bg-[#030b1f] text-white">
      <WatchNavbar
        categories={categories}
        countries={countries}
        listTypes={listTypes}
      />

      {children}
    </div>
  );
}