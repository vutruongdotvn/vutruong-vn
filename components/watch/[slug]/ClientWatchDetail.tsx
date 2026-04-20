"use client";

import { useEffect, useState } from "react";
import WatchPlayer from "@/components/watch/detail/WatchPlayer";
import WatchServerTabs from "@/components/watch/detail/WatchServerTabs";
import WatchDetailHero from "@/components/watch/detail/WatchDetailHero";
import WatchDetailDescription from "@/components/watch/detail/WatchDetailDescription";
import WatchEpisodeList from "@/components/watch/detail/WatchEpisodeList";
import CastSlider from "@/components/watch/detail/CastSlider";
import ImageSlider from "@/components/watch/detail/ImageSlider";
import { getMovieImage, getOPhimMovieDetail, getOPhimPeoples } from "@/lib/watch/ophim";

type Props = {
  slug: string;
  query: { server?: string; ep?: string };
};

export default function ClientWatchDetail({ slug, query }: Props) {
  const [data, setData] = useState<any>(null);
  const [peoples, setPeoples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🌟 CLIENT-SIDE FETCHING: Mọi api đều gọi bằng mạng của người xem
  useEffect(() => {
    let isMounted = true;
    
    const fetchData = async () => {
      setLoading(true);
      try {
        const [movieData, peoplesData] = await Promise.all([
          getOPhimMovieDetail(slug),
          getOPhimPeoples(slug),
        ]);
        
        if (isMounted) {
          setData(movieData);
          setPeoples(peoplesData);
        }
      } catch (err) {
        console.error("Lỗi khi load phim:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => { isMounted = false; };
  }, [slug]);

  // Loading hiển thị mượt mà trong lúc kéo phim
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <i className="fa-duotone fa-spinner-third animate-spin text-4xl opacity-75"></i>
      </div>
    );
  }

  if (!data?.movie) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white text-xl font-bold">
        Không tìm thấy nội dung phim
      </div>
    );
  }

  // Khôi phục logic chuẩn bị dữ liệu (Giống 100% file gốc của bạn)
  const { movie, episodes, cdn } = data;

  const normalizedMovie = {
    ...movie,
    thumb_url: getMovieImage(movie.thumb_url || movie.poster_url, cdn),
    poster_url: getMovieImage(movie.poster_url || movie.thumb_url, cdn),
  };

  const hasPlayerQuery = Boolean(query.server && query.ep);
  const requestedServer = Number(query.server ?? 1);
  const requestedEpisode = Number(query.ep ?? 1);

  const safeServerNumber = Number.isFinite(requestedServer) && requestedServer >= 1 && requestedServer <= episodes.length ? requestedServer : 1;
  const currentServer = episodes[safeServerNumber - 1];
  const currentEpisodeList = currentServer?.server_data ?? [];

  const safeEpisodeNumber = Number.isFinite(requestedEpisode) && requestedEpisode >= 1 && requestedEpisode <= currentEpisodeList.length ? requestedEpisode : 1;
  const currentEpisode = currentEpisodeList[safeEpisodeNumber - 1] ?? null;

  const embedUrl = hasPlayerQuery && currentEpisode ? currentEpisode.link_embed || currentEpisode.link_m3u8 || "" : "";

  // Render UI
  return (
    <main className="min-h-screen bg-black text-white animate-in fade-in duration-500">
      {hasPlayerQuery && (
        <WatchPlayer
          title={normalizedMovie.name}
          episodeName={currentEpisode?.name ? `Tập ${currentEpisode.name}` : `Tập ${safeEpisodeNumber}`}
          embedUrl={embedUrl}
          backdropUrl={normalizedMovie.poster_url}
        />
      )}

      <section className="relative">
        <WatchDetailHero movie={normalizedMovie} compact={hasPlayerQuery} />
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-26 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="grid gap-4 grid-cols-1">
            <div className="space-y-4">
              <WatchServerTabs slug={slug} servers={episodes} activeServer={safeServerNumber} activeEpisode={safeEpisodeNumber} />
              <WatchEpisodeList slug={slug} episodes={episodes} activeServer={safeServerNumber} activeEpisode={safeEpisodeNumber} />
              <WatchDetailDescription movie={normalizedMovie} />
              <ImageSlider slug={slug} />
              <CastSlider actors={peoples.length ? peoples : movie.actor} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}