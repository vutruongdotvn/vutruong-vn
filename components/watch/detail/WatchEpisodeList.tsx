import Link from "next/link";

type EpisodeItem = {
  name?: string;
  slug?: string;
  link_embed?: string;
  link_m3u8?: string;
};

type EpisodeServer = {
  server_name?: string;
  server_data?: EpisodeItem[];
};

type WatchEpisodeListProps = {
  slug: string;
  episodes: EpisodeServer[];
  activeServer?: number;
  activeEpisode?: number;
};

export default function WatchEpisodeList({
  slug,
  episodes,
  activeServer = 1,
  activeEpisode = 1,
}: WatchEpisodeListProps) {
  if (!episodes?.length) return null;

  const currentServer = episodes[activeServer - 1];
  const episodeList = currentServer?.server_data ?? [];

  return (
    <section className="space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-white">
            Danh sách tập
          </h2>
        </div>

        <p className="text-xs text-white/40">
          {episodeList.length} tập khả dụng
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
        {episodeList.map((episode, index) => {
          const episodeNumber = index + 1;
          const isActive = episodeNumber === activeEpisode;

          return (
            <Link
              key={`${episode.slug || episode.name}-${index}`}
              href={`/watch/${slug}?server=${activeServer}&ep=${episodeNumber}`}
              className={[
                "group rounded-2xl border px-4 py-3 text-center transition",
                isActive
                  ? "border-white bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.12)]"
                  : "border-white/10 bg-white/5 text-white/75 hover:border-white/20 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              <div className="text-xs font-medium tracking-[0.18em] uppercase opacity-55">
                Tập
              </div>
              <div className="mt-1 text-sm font-semibold">
                {episode.name || episodeNumber}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}