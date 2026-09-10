import { notFound } from "next/navigation";
import WatchMovieDetail from "@/components/watch/movie/WatchMovieDetail";
import { isWatchMovieSlug } from "@/lib/watch/nguoncEndpoints";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function WatchMoviePage({ params }: Props) {
  const { slug } = await params;

  // Validate the route only. Movie data still loads exclusively in the browser,
  // below WatchGuard and after the existing per-request authorization check.
  if (!isWatchMovieSlug(slug)) notFound();

  return <WatchMovieDetail slug={slug} />;
}
