import WatchHero from "@/components/watch/WatchHero";
import WatchNavbar from "@/components/watch/WatchNavbar";
import WatchSectionSlider from "@/components/watch/WatchSectionSlider";
import WatchTopics from "@/components/watch/WatchTopics";
import { HOME_SECTIONS } from "@/lib/watch/constants";
import {
  getCategories,
  getCountries,
  getHeroMovies,
  getListTypes,
  getSectionMovies,
} from "@/lib/watch/ophim";

export const metadata = {
  title: "VT Films",
  description: "Xem phim online trên VT Films",
};

export default async function WatchHomePage() {
  const [heroMovies, sectionResults, categories, countries, listTypes] =
    await Promise.all([
      getHeroMovies(),
      Promise.all(
        HOME_SECTIONS.map(async (section) => ({
          ...section,
          movies: await getSectionMovies(section.api),
        }))
      ),
      getCategories(),
      getCountries(),
      getListTypes(),
    ]);

  return (
    <main className="min-h-screen bg-[#030b1f] text-white">
      <WatchNavbar
        categories={categories}
        countries={countries}
        listTypes={listTypes}
      />

      {/* Debug tạm - xoá sau */}
      <div className="hidden">
        categories: {categories.length} | countries: {countries.length}
      </div>

      <WatchHero movies={heroMovies} />

      <div className="mx-auto flex w-full max-w-[1450px] flex-col gap-16 px-5 py-12 md:px-8 md:py-16 xl:px-10">
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