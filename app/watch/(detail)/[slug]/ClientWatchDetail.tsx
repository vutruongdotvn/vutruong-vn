"use client";

import { useEffect, useState } from "react";
import WatchPlayer from "@/components/watch/detail/WatchPlayer";
import WatchServerTabs from "@/components/watch/detail/WatchServerTabs";
import WatchDetailHero from "@/components/watch/detail/WatchDetailHero";
import WatchDetailDescription from "@/components/watch/detail/WatchDetailDescription";
import WatchEpisodeList from "@/components/watch/detail/WatchEpisodeList";
import CastSlider from "@/components/watch/detail/CastSlider";
import ImageSlider from "@/components/watch/detail/ImageSlider";
import { getMovieImage } from "@/lib/watch/ophim";

type Props = { slug: string; query: { server?: string; ep?: string }; };

export default function ClientWatchDetail({ slug, query }: Props) {
  const [data, setData] = useState<any>(null);
  const [peoples, setPeoples] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    const fetchData = async () => {
      try {
        const [movieRes, peoplesRes] = await Promise.all([
          fetch(`https://ophim1.com/v1/api/phim/${slug}`).then(res => res.json()),
          fetch(`https://ophim1.com/v1/api/phim/${slug}/peoples`).then(res => res.json()),
        ]);

        if (isMounted) {
          setData(movieRes?.data);
          const peoplesData = peoplesRes?.data?.peoples || [];
          const baseImg = peoplesRes?.data?.profile_sizes?.w185 || "";
          setPeoples(peoplesData.map((p: any) => ({
             name: p.name, thumb_url: p.profile_path ? `${baseImg}${p.profile_path}` : null, character: p.character,
          })));
        }
      } catch (err) { console.error("Lỗi fetch phim:", err); } 
      finally { if (isMounted) setLoading(false); }
    };

    fetchData();
    return () => { isMounted = false; };
  }, [slug]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <i className="fa-duotone fa-spinner-third animate-spin text-4xl text-slate-400 opacity-30"></i>
    </div>
  );

  if (!data?.item) return <div className="min-h-screen bg-black text-white p-10 text-center text-xl mt-32">Không tìm thấy phim</div>;

  const movie = data.item;
  const episodes = movie.episodes || [];
  const cdn = `${data.APP_DOMAIN_CDN_IMAGE || "https://img.ophim.live"}/uploads/movies/`;

  const normalizedMovie = {
    ...movie,
    thumb_url: getMovieImage(movie.thumb_url || movie.poster_url, cdn),
    poster_url: getMovieImage(movie.poster_url || movie.thumb_url, cdn),
  };

  const hasPlayerQuery = Boolean(query.server && query.ep);
  const safeServerNumber = Number(query.server) || 1;
  const safeEpisodeNumber = Number(query.ep) || 1;
  const currentEpisode = episodes[safeServerNumber - 1]?.server_data?.[safeEpisodeNumber - 1];
  const embedUrl = hasPlayerQuery && currentEpisode ? (currentEpisode.link_embed || currentEpisode.link_m3u8 || "") : "";

  return (
    <div className="min-h-screen bg-black text-white animate-in fade-in duration-500">
      {hasPlayerQuery && (
        <WatchPlayer title={normalizedMovie.name} episodeName={`Tập ${currentEpisode?.name || safeEpisodeNumber}`} embedUrl={embedUrl} backdropUrl={normalizedMovie.poster_url} />
      )}
      <section className="relative"><WatchDetailHero movie={normalizedMovie} compact={hasPlayerQuery} /></section>
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-26 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <WatchServerTabs slug={slug} servers={episodes} activeServer={safeServerNumber} activeEpisode={safeEpisodeNumber} />
          <WatchEpisodeList slug={slug} episodes={episodes} activeServer={safeServerNumber} activeEpisode={safeEpisodeNumber} />
          <WatchDetailDescription movie={normalizedMovie} />
          <ImageSlider slug={slug} />
          <CastSlider actors={peoples.length ? peoples : movie.actor}/>
        </div>
      </section>
    </div>
  );
}