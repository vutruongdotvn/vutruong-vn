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

type WatchServerTabsProps = {
  slug: string;
  servers: EpisodeServer[];
  activeServer: number;
  activeEpisode?: number;
};

export default function WatchServerTabs({
  slug,
  servers,
  activeServer,
  activeEpisode = 1,
}: WatchServerTabsProps) {
  if (!servers?.length) return null;

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-2 backdrop-blur-xl">
      <div className="flex flex-wrap gap-2">
        {servers.map((server, index) => {
          const serverNumber = index + 1;
          const isActive = serverNumber === activeServer;

          return (
            <Link
              key={`${server.server_name}-${index}`}
              href={`/watch/${slug}?server=${serverNumber}&ep=${activeEpisode}`}
              className={[
                "inline-flex items-center rounded-2xl px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-white text-black"
                  : "border border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
              ].join(" ")}
            >
              {server.server_name || `Server ${serverNumber}`}
            </Link>
          );
        })}
      </div>
    </div>
  );
}