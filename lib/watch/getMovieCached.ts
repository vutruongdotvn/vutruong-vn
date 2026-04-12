import { cache } from "react";
import { getOPhimMovieDetail } from "@/lib/watch/ophim";

export const getMovieCached = cache(async (slug: string) => {
  return await getOPhimMovieDetail(slug);
});