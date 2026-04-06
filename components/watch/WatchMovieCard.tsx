import Link from "next/link";
import Image from "next/image";
import { getMovieImage } from "@/lib/watch/ophim";
import type { OPhimMovie } from "@/lib/watch/types";

type Props = {
  movie: OPhimMovie;
};

export default function WatchMovieCard({ movie }: Props) {
  const image = getMovieImage(movie.thumb_url || movie.poster_url);

  return (
    <Link
      href={`/watch/${movie.slug}`}
      className="group block min-w-[205px] max-w-[205px] shrink-0 snap-start"
    >
      <div className="relative overflow-hidden rounded-[16px] bg-[#0f172a] shadow-[0_10px_30px_rgba(0,0,0,.35)]">
        <div className="relative aspect-[2/3] overflow-hidden rounded-[16px]">
          <Image
            src={image}
            alt={movie.name}
            fill
            className="object-cover transition duration-500 group-hover:scale-[1.04]"
            sizes="205px"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />

          {(movie.episode_current || movie.year) && (
            <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-1 text-[11px] font-bold text-white shadow">
              {movie.episode_current || movie.year}
            </span>
          )}
        </div>

        <div className="px-2.5 pb-1 pt-3">
          <h3 className="line-clamp-1 text-[16px] font-extrabold leading-tight text-white">
            {movie.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-[14px] text-slate-400">
            {movie.origin_name || ""}
          </p>
        </div>
      </div>
    </Link>
  );
}