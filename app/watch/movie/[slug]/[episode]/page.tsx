import { notFound } from "next/navigation";
import WatchMoviePlayer from "@/components/watch/movie/WatchMoviePlayer";
import { isWatchMovieSlug } from "@/lib/watch/nguoncEndpoints";
import { isWatchEpisodeSegment } from "@/lib/watch/watchRoutes";

type Props = {
  params: Promise<{ slug: string; episode: string }>;
};

export default async function WatchEpisodePage({ params }: Props) {
  const { slug, episode } = await params;

  if (!isWatchMovieSlug(slug) || !isWatchEpisodeSegment(episode)) {
    notFound();
  }

  return <WatchMoviePlayer slug={slug} episodeSegment={episode} />;
}
