import Link from "next/link";
import Image from "next/image";

const API_BASE = "https://ophim1.com/v1/api";
const FALLBACK_CDN = "https://img.ophim.live/uploads/movies/";

const TOPICS = [
  { name: "Thuyết Minh", slug: "thuyet-minh", color: "from-pink-500 to-rose-500" },
  { name: "Lồng Tiếng Cực Mạnh", slug: "long-tieng", color: "from-sky-500 to-cyan-500" },
  { name: "Vietsub", slug: "vietsub", color: "from-violet-500 to-fuchsia-400" },
  { name: "Xuyên Không", slug: "xuyen-khong", color: "from-orange-500 to-amber-400" },
  { name: "Cổ Trang", slug: "co-trang", color: "from-emerald-500 to-teal-400" },
  { name: "Phim Chiếu Rạp", slug: "phim-chieu-rap", color: "from-indigo-500 to-violet-400" },
  { name: "Phim Việt Nam", slug: "viet-nam", color: "from-pink-500 to-rose-400" },
  { name: "TV Shows", slug: "tv-shows", color: "from-yellow-500 to-lime-400" },
];

const HOME_SECTIONS = [
  { title: "Phim", highlight: "Hành Động", slug: "hanh-dong", endpoint: "/the-loai/hanh-dong" },
  { title: "Phim", highlight: "Tình Cảm", slug: "tinh-cam", endpoint: "/the-loai/tinh-cam" },
  { title: "Phim", highlight: "Kinh Dị", slug: "kinh-di", endpoint: "/the-loai/kinh-di" },
  { title: "Phim", highlight: "Hài Hước", slug: "hai-huoc", endpoint: "/the-loai/hai-huoc" },
  { title: "Phim", highlight: "Cổ Trang", slug: "co-trang", endpoint: "/the-loai/co-trang" },
  { title: "Phim", highlight: "Tâm Lý", slug: "tam-ly", endpoint: "/the-loai/tam-ly" },
  { title: "Phim", highlight: "Hoạt Hình", slug: "hoat-hinh", endpoint: "/the-loai/hoat-hinh" },
  { title: "Phim", highlight: "Việt Nam", slug: "viet-nam", endpoint: "/quoc-gia/viet-nam" },
];

type OPhimItem = {
  name: string;
  origin_name?: string;
  slug: string;
  thumb_url?: string;
  poster_url?: string;
  year?: number;
  quality?: string;
  lang?: string;
  episode_current?: string;
  time?: string;
  content?: string;
  imdb?: {
    id?: string;
    vote_average?: number;
  };
  tmdb?: {
    vote_average?: number;
  };
  category?: { name: string; slug: string }[];
  country?: { name: string; slug: string }[];
};

type HeroMovie = OPhimItem & {
  _bgUrl?: string;
  _thumbUrl?: string;
  _detailCdn?: string;
};

async function fetchJson(url: string) {
  try {
    const res = await fetch(url, {
      next: { revalidate: 1800 }, // 30 phút
      headers: {
        accept: "application/json",
      },
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function getImgUrl(path?: string, base = FALLBACK_CDN) {
  if (!path) return "https://placehold.co/1280x720/0b1020/ffffff?text=VT+Films";
  if (path.startsWith("http")) return path;
  return `${base}${path}`;
}

function stripHtml(html?: string) {
  if (!html) return "";
  return html.replace(/<[^>]+>/g, "").trim();
}

function clampText(text: string, max = 220) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}...` : text;
}

async function getHomeData() {
  const home = await fetchJson(`${API_BASE}/home`);

  const newestItems: OPhimItem[] = home?.data?.items?.slice(0, 10) || [];
  const homeCdn = (home?.data?.APP_DOMAIN_CDN_IMAGE || FALLBACK_CDN).replace(/\/$/, "") + "/uploads/movies/";

  // Fetch detail 10 phim hero để lấy poster ngang / content / extra info
  const detailResults = await Promise.all(
    newestItems.map((item) => fetchJson(`${API_BASE}/phim/${item.slug}`))
  );

  const heroMovies: HeroMovie[] = newestItems.map((item, idx) => {
    const detail = detailResults[idx]?.data?.item || {};
    const detailCdn =
      (detailResults[idx]?.data?.APP_DOMAIN_CDN_IMAGE || FALLBACK_CDN).replace(/\/$/, "") +
      "/uploads/movies/";

    const bgUrl = getImgUrl(
      detail.poster_url || detail.thumb_url || item.poster_url || item.thumb_url,
      detailCdn
    );

    const thumbUrl = getImgUrl(item.thumb_url || item.poster_url, homeCdn);

    return {
      ...item,
      ...detail,
      _bgUrl: bgUrl,
      _thumbUrl: thumbUrl,
      _detailCdn: detailCdn,
    };
  });

  const sections = await Promise.all(
    HOME_SECTIONS.map(async (section) => {
      const data = await fetchJson(`${API_BASE}${section.endpoint}?page=1`);
      return {
        ...section,
        items: (data?.data?.items || []).slice(0, 12),
      };
    })
  );

  return {
    heroMovies,
    sections,
  };
}

function MovieBadge({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-semibold text-white shadow-lg ${className}`}
    >
      {children}
    </span>
  );
}

function MovieCard({ movie }: { movie: OPhimItem }) {
  const poster = getImgUrl(movie.thumb_url || movie.poster_url);

  return (
    <Link
      href={`/phim/${movie.slug}`}
      className="group block min-w-[180px] max-w-[180px] shrink-0"
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.03] shadow-[0_20px_80px_rgba(0,0,0,0.35)] transition duration-300 group-hover:-translate-y-1 group-hover:border-white/10">
        <div className="relative aspect-[2/3] overflow-hidden">
          <Image
            src={poster}
            alt={movie.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-105"
            sizes="180px"
            unoptimized
          />

          <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
            <span className="rounded-lg bg-black/70 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {movie.episode_current || movie.year || "Full"}
            </span>
          </div>

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
        </div>

        <div className="space-y-1 px-2 pb-2 pt-3">
          <h3 className="line-clamp-1 text-sm font-bold text-white">{movie.name}</h3>
          <p className="line-clamp-1 text-xs text-white/50">
            {movie.origin_name || movie.name}
            {movie.year ? ` (${movie.year})` : ""}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default async function FilmsHomePage() {
  const { heroMovies, sections } = await getHomeData();
  const activeHero = heroMovies[0];

  return (
    <main className="min-h-screen bg-[#020817] text-white">
      {/* HERO */}
      <section className="relative min-h-screen overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <Image
            src={activeHero?._bgUrl || "https://placehold.co/1600x900/0b1020/ffffff?text=VT+Films"}
            alt={activeHero?.name || "Hero"}
            fill
            priority
            className="object-cover object-center"
            sizes="100vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-[#020817]/55" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#020817] via-[#020817]/78 to-[#020817]/15" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#020817] via-transparent to-[#020817]/15" />
        </div>

        {/* Hero content */}
        <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-[1600px] items-center px-4 pb-20 pt-28 sm:px-6 lg:px-10">
          <div className="grid w-full items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="max-w-3xl">
              <p className="mb-3 text-sm font-medium text-white/55">
                Phim mới cập nhật
              </p>

              <h1 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl xl:text-6xl">
                {activeHero?.name}
              </h1>

              <p className="mt-2 text-lg text-white/55">
                {activeHero?.origin_name || "VT Films"}
              </p>

              <div className="mt-6 flex flex-wrap gap-2">
                {activeHero?.imdb?.vote_average ? (
                  <MovieBadge className="bg-amber-500 text-black">
                    ⭐ IMDb {Number(activeHero.imdb.vote_average).toFixed(1)}
                  </MovieBadge>
                ) : activeHero?.tmdb?.vote_average ? (
                  <MovieBadge className="bg-amber-500 text-black">
                    ⭐ TMDb {Number(activeHero.tmdb.vote_average).toFixed(1)}
                  </MovieBadge>
                ) : null}

                {activeHero?.episode_current && (
                  <MovieBadge className="bg-emerald-500">
                    {activeHero.episode_current}
                  </MovieBadge>
                )}

                {activeHero?.quality && (
                  <MovieBadge className="bg-blue-500">
                    {activeHero.quality}
                  </MovieBadge>
                )}

                {activeHero?.lang && (
                  <MovieBadge className="bg-cyan-500">
                    {activeHero.lang}
                  </MovieBadge>
                )}

                {activeHero?.year && (
                  <MovieBadge className="bg-violet-500">
                    {activeHero.year}
                  </MovieBadge>
                )}

                {activeHero?.country?.[0]?.name && (
                  <MovieBadge className="bg-pink-500">
                    {activeHero.country[0].name}
                  </MovieBadge>
                )}

                {activeHero?.category?.slice(0, 3).map((cat) => (
                  <MovieBadge key={cat.slug} className="bg-white/10 backdrop-blur">
                    {cat.name}
                  </MovieBadge>
                ))}
              </div>

              <p className="mt-8 max-w-2xl text-sm leading-8 text-white/72 sm:text-base">
                {clampText(stripHtml(activeHero?.content), 260) ||
                  "Khám phá kho phim online chất lượng cao với giao diện điện ảnh, tốc độ nhanh và trải nghiệm xem mượt mà trên VT Films."}
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={`/phim/${activeHero?.slug}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-red-500 px-7 py-4 text-sm font-bold text-white shadow-[0_20px_60px_rgba(239,68,68,0.35)] transition hover:scale-[1.02] hover:bg-red-400"
                >
                  ▶ Xem phim
                </Link>

                <Link
                  href="/phim/phim-moi"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-7 py-4 text-sm font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
                >
                  Xem phim mới
                </Link>
              </div>
            </div>

            {/* Right spacer / cinematic balance */}
            <div className="hidden lg:block" />
          </div>
        </div>

        {/* Hero thumbs */}
        {heroMovies.length > 0 && (
          <div className="absolute bottom-8 left-1/2 z-20 w-full max-w-[1600px] -translate-x-1/2 px-4 sm:px-6 lg:px-10">
            <div className="mx-auto flex max-w-[760px] gap-3 overflow-x-auto rounded-3xl border border-white/10 bg-black/20 p-3 backdrop-blur-xl scrollbar-none">
              {heroMovies.map((movie, index) => (
                <Link
                  key={movie.slug}
                  href={`/phim/${movie.slug}`}
                  className={`group relative block h-[110px] min-w-[74px] overflow-hidden rounded-2xl border transition ${
                    index === 0
                      ? "border-white/30 opacity-100"
                      : "border-white/10 opacity-65 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={movie._thumbUrl || getImgUrl(movie.thumb_url || movie.poster_url)}
                    alt={movie.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                    sizes="74px"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* TOPIC WRAP */}
      <section className="relative z-10 mx-auto w-full max-w-[1600px] px-4 py-16 sm:px-6 lg:px-10">
        <div className="mb-8">
          <h2 className="text-3xl font-black tracking-tight text-white">
            Bạn đang quan tâm gì?
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-8">
          {TOPICS.map((topic) => (
            <Link
              key={topic.slug}
              href={`/phim/${topic.slug}`}
              className={`group rounded-[26px] bg-gradient-to-br ${topic.color} p-[1px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] transition hover:-translate-y-1`}
            >
              <div className="h-full rounded-[25px] bg-black/10 px-5 py-6 backdrop-blur-sm">
                <h3 className="text-xl font-black text-white">{topic.name}</h3>
                <p className="mt-4 text-sm font-medium text-white/80">Xem chủ đề ›</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* SECTION WRAP */}
      <section className="mx-auto w-full max-w-[1600px] space-y-16 px-4 pb-20 sm:px-6 lg:px-10">
        {sections.map((section) => {
          if (!section.items?.length) return null;

          return (
            <div key={section.slug}>
              <div className="mb-6 flex items-center justify-between gap-4">
                <h2 className="text-3xl font-black tracking-tight text-white">
                  {section.title}{" "}
                  <span className="bg-gradient-to-r from-orange-400 to-pink-500 bg-clip-text text-transparent">
                    {section.highlight}
                  </span>
                </h2>

                <Link
                  href={`/phim/${section.slug}`}
                  className="text-sm font-semibold text-white/55 transition hover:text-white"
                >
                  Xem toàn bộ →
                </Link>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                {section.items.map((movie: OPhimItem) => (
                  <MovieCard key={`${section.slug}-${movie.slug}`} movie={movie} />
                ))}
              </div>
            </div>
          );
        })}
      </section>
    </main>
  );
}