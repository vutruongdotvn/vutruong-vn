import { notFound } from "next/navigation";
import Link from "next/link";

import WatchPlayer from "@/components/watch/detail/WatchPlayer";
import WatchServerTabs from "@/components/watch/detail/WatchServerTabs";
import WatchDetailHero from "@/components/watch/detail/WatchDetailHero";
import WatchDetailMeta from "@/components/watch/detail/WatchDetailMeta";
import WatchDetailInfoGrid from "@/components/watch/detail/WatchDetailInfoGrid";
import WatchDetailDescription from "@/components/watch/detail/WatchDetailDescription";
import WatchEpisodeList from "@/components/watch/detail/WatchEpisodeList";

import { getMovieImage, getOPhimMovieDetail } from "@/lib/watch/ophim";

type WatchDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    server?: string;
    ep?: string;
  }>;
};

export async function generateMetadata({ params }: WatchDetailPageProps) {
  const { slug } = await params;

  try {
    const data = await getOPhimMovieDetail(slug);
    const movie = data?.movie;

    if (!movie) {
      return {
        title: "Không tìm thấy phim | VT Films",
        description: "Trang phim không tồn tại.",
      };
    }

    const plainDescription =
      movie.content?.replace(/<[^>]*>/g, "").slice(0, 160) ||
      `Xem thông tin phim ${movie.name} trên VT Films.`;

    return {
      title: `${movie.name} | VT Films`,
      description: plainDescription,
      openGraph: {
        title: `${movie.name} | VT Films`,
        description: plainDescription,
        images: [getMovieImage(movie.thumb_url || movie.poster_url, data.cdn)],
      },
    };
  } catch {
    return {
      title: "VT Films",
      description: "Xem phim tại VT Films",
    };
  }
}

export default async function WatchDetailPage({
  params,
  searchParams,
}: WatchDetailPageProps) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};

  const data = await getOPhimMovieDetail(slug);

  if (!data?.movie) {
    notFound();
  }

  const { movie, episodes, cdn } = data;

  const normalizedMovie = {
    ...movie,
    thumb_url: getMovieImage(movie.thumb_url || movie.poster_url, cdn),
    poster_url: getMovieImage(movie.poster_url || movie.thumb_url, cdn),
  };

  const hasPlayerQuery = Boolean(query.server && query.ep);

  const requestedServer = Number(query.server ?? 1);
  const requestedEpisode = Number(query.ep ?? 1);

  const safeServerNumber =
    Number.isFinite(requestedServer) &&
    requestedServer >= 1 &&
    requestedServer <= episodes.length
      ? requestedServer
      : 1;

  const currentServer = episodes[safeServerNumber - 1];
  const currentEpisodeList = currentServer?.server_data ?? [];

  const safeEpisodeNumber =
    Number.isFinite(requestedEpisode) &&
    requestedEpisode >= 1 &&
    requestedEpisode <= currentEpisodeList.length
      ? requestedEpisode
      : 1;

  const currentEpisode =
    currentEpisodeList[safeEpisodeNumber - 1] ?? null;

  const embedUrl =
    hasPlayerQuery && currentEpisode
      ? currentEpisode.link_embed || currentEpisode.link_m3u8 || ""
      : "";

  const watchFirstHref =
    episodes?.length && episodes[0]?.server_data?.length
      ? `/watch/${slug}?server=1&ep=1`
      : `/watch/${slug}`;

  const continueHref =
    hasPlayerQuery && currentEpisode
      ? `/watch/${slug}?server=${safeServerNumber}&ep=${safeEpisodeNumber}`
      : watchFirstHref;

  return (
    <main className="min-h-screen bg-black text-white">
      {hasPlayerQuery ? (
        <WatchPlayer
          title={normalizedMovie.name}
          episodeName={
            currentEpisode?.name
              ? `Tập ${currentEpisode.name}`
              : `Tập ${safeEpisodeNumber}`
          }
          embedUrl={embedUrl}
          backdropUrl={normalizedMovie.poster_url}
        />
      ) : null}

      <section className="relative">
        <WatchDetailHero movie={normalizedMovie} compact={hasPlayerQuery} />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <WatchServerTabs
            slug={slug}
            servers={episodes}
            activeServer={safeServerNumber}
            activeEpisode={safeEpisodeNumber}
          />

          <div className="grid gap-8 lg:grid-cols-[1.1fr_360px]">
            <div className="space-y-8">
              <WatchDetailMeta movie={normalizedMovie} />

              <WatchEpisodeList
                slug={slug}
                episodes={episodes}
                activeServer={safeServerNumber}
                activeEpisode={safeEpisodeNumber}
              />

              <WatchDetailDescription movie={normalizedMovie} />
            </div>

            <aside className="space-y-6">
              <WatchDetailInfoGrid movie={normalizedMovie} />

            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}