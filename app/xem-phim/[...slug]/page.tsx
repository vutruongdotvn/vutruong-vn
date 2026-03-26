import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string[] }>;

async function getMovieDetail(movieSlug: string) {
  const res = await fetch(`https://ophim1.com/phim/${movieSlug}`, {
    next: { revalidate: 60 * 30 },
  });

  if (!res.ok) return null;

  return res.json();
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const movieSlug = slug?.[0];

  if (!movieSlug) {
    return {
      title: "Xem phim | VT Films",
    };
  }

  const data = await getMovieDetail(movieSlug);
  const movie = data?.movie;

  return {
    title: movie ? `Xem ${movie.name} | VT Films` : "Xem phim | VT Films",
  };
}

export default async function WatchMoviePage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;

  const movieSlug = slug?.[0];
  const episodeSlug = slug?.[1];

  if (!movieSlug) return notFound();

  const data = await getMovieDetail(movieSlug);
  if (!data?.movie) return notFound();

  const movie = data.movie;
  const episodes = data.episodes || [];

  const allEpisodes = episodes.flatMap((server: any) =>
    (server.server_data || []).map((ep: any) => ({
      ...ep,
      server_name: server.server_name,
    }))
  );

  const currentEpisode =
    allEpisodes.find((ep: any) => ep.slug === episodeSlug) ||
    allEpisodes.find((ep: any) => ep.name === episodeSlug) ||
    allEpisodes[0];

  if (!currentEpisode) return notFound();

  const iframeSrc = currentEpisode.link_embed || currentEpisode.link_m3u8;

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-10 text-white md:px-6">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Header */}
        <div className="space-y-3">
          <Link
            href={`/phim/${movie.slug}`}
            className="inline-flex text-sm text-white/60 hover:text-white"
          >
            ← Quay lại chi tiết phim
          </Link>

          <h1 className="text-2xl font-black md:text-4xl">{movie.name}</h1>
          <p className="text-white/60">
            Đang xem:{" "}
            <span className="font-semibold text-white">
              {currentEpisode.name}
            </span>
          </p>
        </div>

        {/* Player */}
        <section className="overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
          <div className="aspect-video w-full">
            {iframeSrc ? (
              <iframe
                src={iframeSrc}
                className="h-full w-full"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/60">
                Không có nguồn phát.
              </div>
            )}
          </div>
        </section>

        {/* Episode list */}
        <section className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
          <h2 className="mb-5 text-xl font-bold">Danh sách tập</h2>

          <div className="space-y-6">
            {episodes.map((server: any, index: number) => (
              <div key={index}>
                <h3 className="mb-3 text-base font-semibold text-white/90">
                  {server.server_name}
                </h3>

                <div className="flex flex-wrap gap-3">
                  {server.server_data?.map((ep: any, epIndex: number) => {
                    const isActive =
                      ep.slug === currentEpisode.slug ||
                      ep.name === currentEpisode.name;

                    return (
                      <Link
                        key={epIndex}
                        href={`/xem-phim/${movie.slug}/${ep.slug || ep.name}`}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                          isActive
                            ? "bg-red-500 text-white"
                            : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
                        }`}
                      >
                        {ep.name}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}