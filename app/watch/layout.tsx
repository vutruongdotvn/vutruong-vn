import type { Metadata } from "next";
import WatchNavbar from "@/components/watch/WatchNavbar";
import {
  getCategories,
  getCountries,
  getListTypes,
} from "@/lib/watch/ophim";

export const metadata: Metadata = {
  title: "VT Watch!",
  description:
    "Xem phim miễn phí - tốc độ cao - không quảng cáo và cập nhật liên tục!",
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
    <div className="min-h-screen bg-[#030b1f] text-white">
      <WatchNavbar
        categories={categories}
        countries={countries}
        listTypes={listTypes}
      />

      {children}
    </div>
  );
}