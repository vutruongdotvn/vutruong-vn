import Image from "next/image";
import Link from "next/link";

type WatchDetailHeroProps = {
  movie: {
    name: string;
    origin_name?: string;
    slug: string;
    thumb_url?: string;
    poster_url?: string;
    quality?: string;
    lang?: string;
    year?: number | string;
    episode_current?: string;
    category?: { name: string; slug: string }[];
    country?: { name: string; slug: string }[];
  };
  compact?: boolean;
};

export default function WatchDetailHero({
  movie,
  compact = false,
}: WatchDetailHeroProps) {
  const backdrop = movie.poster_url || movie.thumb_url || "";
  const poster = movie.thumb_url || movie.poster_url || "";
  const watchHref = `/watch/${movie.slug}?server=1&ep=1`;

  return (
    <section
      className={[
        "relative overflow-hidden",
        compact ? "min-h-[40vh]" : "min-h-screen",
      ].join(" ")}
    >
      <div className="absolute inset-0">
        <Image
          src={backdrop}
          alt={movie.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-black/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_45%)]" />
      </div>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-4 pb-12 pt-50 sm:px-6 lg:flex-row lg:items-center lg:px-8">
        <div className="relative mx-auto aspect-[2/3] w-[280px] overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-black/40 sm:w-[280px] lg:mx-0 lg:w-[440px]">
          <Image
            src={poster}
            alt={movie.name}
            fill
            sizes="(max-width: 640px) 180px, (max-width: 1024px) 220px, 260px"
            className="object-cover"
          />
        </div>

        <div className="max-w-4xl flex-1">
          <div className="flex flex-wrap items-center sm:justify-start justify-center gap-2 text-xs font-medium tracking-[0.18em] text-white/65 uppercase">
            {movie.quality ? (
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                {movie.quality}
              </span>
            ) : null}

            {movie.lang ? (
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                {movie.lang}
              </span>
            ) : null}

            {movie.year ? (
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                {movie.year}
              </span>
            ) : null}

            {movie.episode_current ? (
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1">
                {movie.episode_current}
              </span>
            ) : null}
          </div>

          <h1 className="mt-5 text-3xl text-center sm:text-start font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
            {movie.name}
          </h1>

          {movie.origin_name ? (
            <p className="mt-3 text-center sm:text-start text-base text-white/60 sm:text-lg">
              {movie.origin_name}
            </p>
          ) : null}

          {(movie.category?.length || movie.country?.length) ? (
            <div className="mt-6 flex flex-wrap gap-2 sm:justify-start justify-center">
              {movie.category?.map((item) => (
                <span
                  key={`cat-${item.slug}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75"
                >
                  {item.name}
                </span>
              ))}

              {movie.country?.map((item) => (
                <span
                  key={`country-${item.slug}`}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75"
                >
                  {item.name}
                </span>
              ))}
            </div>
          ) : null}

          <div className="mt-8 flex flex-wrap gap-3 sm:justify-start justify-center">
            <Link
              href={watchHref}
              className="inline-flex items-center justify-center rounded-2xl bg-white px-12 py-3 text-base font-semibold text-black transition hover:scale-[1.02] hover:bg-white/90"
            >
              Xem phim
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}