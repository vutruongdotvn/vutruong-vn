import type { Metadata } from "next";
import WatchHero from "@/components/watch/WatchHero";
import WatchSectionSlider from "@/components/watch/WatchSectionSlider";
import WatchTopics from "@/components/watch/WatchTopics";
import { HOME_SECTIONS } from "@/lib/watch/constants";
import { getHeroMovies } from "@/lib/watch/ophim";
// Cache trong 1 giờ, hoặc thậm chí 1 ngày (86400)
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "VT Watch",
  description:
    "Xem phim miễn phí, tốc độ cao, không quảng cáo và cập nhật liên tục.",

  openGraph: {
    title: "VT Watch",
    description:
      "Xem phim miễn phí, tốc độ cao, không quảng cáo và cập nhật liên tục.",
    url: "/watch",
    images: [
      {
        url: "/watch-og.png",
        width: 1200,
        height: 630,
        alt: "VT Watch",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "VT Watch",
    description:
      "Xem phim miễn phí, tốc độ cao, không quảng cáo và cập nhật liên tục.",
    images: ["/watch-og.png"],
  },
};

export default async function WatchHomePage() {
  const heroMovies = await getHeroMovies();

  return (
    <main className="select-none" id="vt-watch-app">
      <WatchHero movies={heroMovies} />

      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-16 px-5 py-12 md:px-8 md:py-16 xl:px-10">
        <WatchTopics />

        {HOME_SECTIONS.map((section) => (
          <WatchSectionSlider
            key={section.id}
            title={section.ti}
            highlight={section.hi}
            type={section.type}
            slug={section.slug}
            api={section.api}
          />
        ))}
      </div>
    </main>
  );
}