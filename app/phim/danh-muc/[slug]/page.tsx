import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<{ page?: string }>;

async function getListMovies(slug: string, page: string = "1") {
  const res = await fetch(`https://ophim1.com/v1/api/danh-sach/${slug}?page=${page}`, {
    next: { revalidate: 60 * 30 },
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function ListPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { slug } = await params;
  const { page = "1" } = await searchParams;

  const data = await getListMovies(slug, page);

  if (!data?.data?.items) return notFound();

  const items = data.data.items || [];
  const seo = data.data.seoOnPage || {};

  return (
    <main className="min-h-screen bg-[#050816] px-4 py-10 text-white md:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10">
          <h1 className="text-3xl font-black md:text-5xl">
            {seo.titleHead || "Danh sách phim"}
          </h1>
          <p className="mt-3 text-white/60">
            Trang {seo.pagination?.currentPage || 1} /{" "}
            {seo.pagination?.totalPages || 1}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
          {items.map((movie: any) => (
            <Link key={movie._id} href={`/phim/${movie.slug}`} className="group">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={movie.poster_url || movie.thumb_url}
                    alt={movie.name}
                    fill
                    className="object-cover transition duration-300 group-hover:scale-105"
                  />
                </div>
              </div>

              <div className="mt-3">
                <h3 className="line-clamp-1 font-semibold">{movie.name}</h3>
                <p className="line-clamp-1 text-sm text-white/50">
                  {movie.origin_name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}