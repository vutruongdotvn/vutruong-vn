import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;

async function getMovieDetail(slug: string) {
  const res = await fetch(`https://ophim1.com/phim/${slug}`, {
    next: { revalidate: 60 * 30 }, // 30 phút
  });

  if (!res.ok) return null;

  const data = await res.json();
  return data;
}

export async function generateMetadata({ params }: { params: Params }) {
  const { slug } = await params;
  const data = await getMovieDetail(slug);

  if (!data?.movie) {
    return {
      title: "Không tìm thấy phim",
    };
  }

  const movie = data.movie;
  const title = `${movie.name} | VT Films`;

  return {
    title,
    description: movie.content?.replace(/<[^>]*>?/gm, "").slice(0, 160),
    openGraph: {
      title,
      description: movie.content?.replace(/<[^>]*>?/gm, "").slice(0, 160),
      images: [movie.thumb_url || movie.poster_url].filter(Boolean),
    },
  };
}

export default async function MovieDetailPage({
  params,
}: {
  params: Params;
}) {
  const { slug } = await params;
  const data = await getMovieDetail(slug);

  if (!data?.movie) return notFound();

  const movie = data.movie;
  const episodes = data.episodes || [];

  const poster =
    movie.poster_url || movie.thumb_url || "/images/fallback-poster.jpg";

  const backdrop =
    movie.thumb_url || movie.poster_url || "/images/fallback-poster.jpg";

  const content =
    movie.content?.replace(/<[^>]*>?/gm, "") || "Chưa có mô tả nội dung.";

  const firstEpisodeSlug =
    episodes?.[0]?.server_data?.[0]?.slug ||
    episodes?.[0]?.server_data?.[0]?.name ||
    null;

  const watchHref = firstEpisodeSlug
    ? `/xem-phim/${movie.slug}/${firstEpisodeSlug}`
    : `/xem-phim/${movie.slug}`;

  return (
    <main className="min-h-screen bg-[#050816] text-white">
      {/* Hero */}
      <section className="relative isolate overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src={backdrop}
            alt={movie.name}
            fill
            className="object-cover opacity-25"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-[#050816]/70 to-[#050816]" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#050816] via-[#050816]/70 to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-4 py-16 md:px-6 md:py-24">
          <div className="grid gap-10 md:grid-cols-[320px_1fr] md:items-end">
            {/* Poster */}
            <div className="relative mx-auto aspect-[2/3] w-full max-w-[320px] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
              <Image
                src={poster}
                alt={movie.name}
                fill
                className="object-cover"
              />
            </div>

            {/* Content */}
            <div className="max-w-4xl">
              <p className="mb-3 text-sm font-medium text-red-400/90">
                Chi tiết phim
              </p>

              <h1 className="text-3xl font-black leading-tight md:text-5xl">
                {movie.name}
              </h1>

              {movie.origin_name && (
                <p className="mt-2 text-base text-white/60 md:text-lg">
                  {movie.origin_name}
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                {movie.quality && (
                  <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm font-semibold text-blue-300">
                    {movie.quality}
                  </span>
                )}
                {movie.lang && (
                  <span className="rounded-full bg-cyan-500/20 px-3 py-1 text-sm font-semibold text-cyan-300">
                    {movie.lang}
                  </span>
                )}
                {movie.year && (
                  <span className="rounded-full bg-purple-500/20 px-3 py-1 text-sm font-semibold text-purple-300">
                    {movie.year}
                  </span>
                )}
                {movie.episode_current && (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-sm font-semibold text-emerald-300">
                    {movie.episode_current}
                  </span>
                )}
                {movie.tmdb?.vote_average && (
                  <span className="rounded-full bg-yellow-500/20 px-3 py-1 text-sm font-semibold text-yellow-300">
                    IMDb {movie.tmdb.vote_average}
                  </span>
                )}
              </div>

              <p className="mt-6 max-w-3xl text-sm leading-7 text-white/75 md:text-base">
                {content}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={watchHref}
                  className="inline-flex items-center rounded-full bg-red-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-red-400"
                >
                  ▶ Xem phim
                </Link>

                <Link
                  href="/phim"
                  className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/10"
                >
                  ← Quay lại
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Info */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="mb-4 text-2xl font-bold">Nội dung phim</h2>
            <p className="leading-8 text-white/75">{content}</p>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <h3 className="mb-4 text-xl font-bold">Thông tin</h3>

              <div className="space-y-3 text-sm text-white/75">
                {movie.year && (
                  <p>
                    <span className="font-semibold text-white">Năm:</span>{" "}
                    {movie.year}
                  </p>
                )}
                {movie.time && (
                  <p>
                    <span className="font-semibold text-white">Thời lượng:</span>{" "}
                    {movie.time}
                  </p>
                )}
                {movie.episode_total && (
                  <p>
                    <span className="font-semibold text-white">Tổng tập:</span>{" "}
                    {movie.episode_total}
                  </p>
                )}
                {movie.status && (
                  <p>
                    <span className="font-semibold text-white">Trạng thái:</span>{" "}
                    {movie.status}
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
              <h3 className="mb-4 text-xl font-bold">Khám phá thêm</h3>

              <div className="flex flex-wrap gap-2">
                {movie.category?.map((item: any) => (
                  <Link
                    key={item.slug}
                    href={`/phim/the-loai/${item.slug}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/75 hover:bg-white/10"
                  >
                    {item.name}
                  </Link>
                ))}

                {movie.country?.map((item: any) => (
                  <Link
                    key={item.slug}
                    href={`/phim/quoc-gia/${item.slug}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white/75 hover:bg-white/10"
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Episodes */}
      {episodes?.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pb-16 md:px-6">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
            <h2 className="mb-6 text-2xl font-bold">Danh sách tập</h2>

            <div className="space-y-6">
              {episodes.map((server: any, index: number) => (
                <div key={index}>
                  <h3 className="mb-3 text-lg font-semibold text-white/90">
                    {server.server_name}
                  </h3>

                  <div className="flex flex-wrap gap-3">
                    {server.server_data?.map((ep: any, epIndex: number) => (
                      <Link
                        key={epIndex}
                        href={`/xem-phim/${movie.slug}/${ep.slug || ep.name}`}
                        className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 transition hover:bg-red-500 hover:text-white"
                      >
                        {ep.name}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}