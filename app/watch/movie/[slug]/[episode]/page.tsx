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

  // Treat movie + episode as the player's identity. This guarantees every
  // navigation starts from the provider's first validated source instead of
  // inheriting local source-selection state from the previous route.
  return (
    <WatchMoviePlayer
      key={`${slug}:${episode}`}
      slug={slug}
      episodeSegment={episode}
    />
  );
}
