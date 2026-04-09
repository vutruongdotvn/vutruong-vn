import type { Metadata } from "next";
import WatchHero from "@/components/watch/WatchHero";
import WatchSectionSlider from "@/components/watch/WatchSectionSlider";
import WatchTopics from "@/components/watch/WatchTopics";
import { HOME_SECTIONS } from "@/lib/watch/constants";
import {
  getHeroMovies,
  getSectionMovies,
} from "@/lib/watch/ophim";

export const metadata: Metadata = {
  title: "Watch",
  description:
    "Xem phim miễn phí - tốc độ cao - không quảng cáo và cập nhật liên tục!",
};

export default async function WatchHomePage() {
  const [heroMovies, sectionResults] = await Promise.all([
    getHeroMovies(),
    Promise.all(
      HOME_SECTIONS.map(async (section) => ({
        ...section,
        movies: await getSectionMovies(section.api),
      }))
    ),
  ]);

  return (
    <main className="min-h-screen text-white">
      <WatchHero movies={heroMovies} />

      <div className="mx-auto flex w-full max-w-[1800px] flex-col gap-16 px-5 py-12 md:px-8 md:py-16 xl:px-10">
        <WatchTopics />

        {sectionResults.map((section) => (
          <WatchSectionSlider
            key={section.id}
            title={section.ti}
            highlight={section.hi}
            type={section.type}
            slug={section.slug}
            movies={section.movies}
          />
        ))}
      </div>
    </main>
  );
}