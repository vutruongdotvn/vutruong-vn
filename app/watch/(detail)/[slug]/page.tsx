import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";

import WatchPlayer from "@/components/watch/detail/WatchPlayer";
import WatchServerTabs from "@/components/watch/detail/WatchServerTabs";
import WatchDetailHero from "@/components/watch/detail/WatchDetailHero";
// import WatchDetailMeta from "@/components/watch/detail/WatchDetailMeta";
// import WatchDetailInfoGrid from "@/components/watch/detail/WatchDetailInfoGrid";
import WatchDetailDescription from "@/components/watch/detail/WatchDetailDescription";
import WatchEpisodeList from "@/components/watch/detail/WatchEpisodeList";
import CastSlider from "@/components/watch/detail/CastSlider";
import { getMovieImage, getOPhimMovieDetail } from "@/lib/watch/ophim";
import { getOPhimPeoples } from "@/lib/watch/ophim";
import ImageSlider from "@/components/watch/detail/ImageSlider";

type WatchDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    server?: string;
    ep?: string;
  }>;
};

function stripHtml(input?: string) {
  if (!input) return "";
  return input.replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
}

function truncateText(text: string, max = 160) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max - 1).trim()}…` : text;
}

export async function generateMetadata({
  params,
}: WatchDetailPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const data = await getOPhimMovieDetail(slug);
    const movie = data?.movie;

    if (!movie) {
      return {
        title: "Không tìm thấy phim",
        description: "Trang phim không tồn tại.",
      };
    }

    const description = truncateText(
      stripHtml(movie.content) || "",
      160
    );

    const poster = getMovieImage(movie.poster_url, data.cdn);

    return {
      title: slug,
      description,

      openGraph: {
        title: slug,
        description,
        url: `/watch/${slug}`,
        images: [
          {
            url: poster,
            width: 1200,
            height: 630,
            alt: slug,
          },
        ],
      },

      twitter: {
        title: slug,
        description,
        images: [poster],
      },
    };
  } catch {
    return {
      title: slug,
      description: "Xem phim tại VT Watch",
    };
  }
}

export default async function WatchDetailPage({
  params,
  searchParams,
}: WatchDetailPageProps) {
  const { slug } = await params;
  const query = (await searchParams) ?? {};

  const [data, peoples] = await Promise.all([
  getOPhimMovieDetail(slug),
  getOPhimPeoples(slug),
]);

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

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-26 sm:px-6 lg:px-8">
        <div className="space-y-4">

          <div className="grid gap-4 grid-cols-1">

            <div className="space-y-4">
              {/*<WatchDetailMeta movie={normalizedMovie} />*/}

              <WatchServerTabs
                slug={slug}
                servers={episodes}
                activeServer={safeServerNumber}
                activeEpisode={safeEpisodeNumber}
              />

              <WatchEpisodeList
                slug={slug}
                episodes={episodes}
                activeServer={safeServerNumber}
                activeEpisode={safeEpisodeNumber}
              />

              <WatchDetailDescription movie={normalizedMovie} />
              <ImageSlider slug={slug} />
              <CastSlider actors={peoples.length ? peoples : movie.actor}/>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}