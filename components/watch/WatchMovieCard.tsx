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
      className="group block w-[184px] shrink-0 snap-start"
    >
      <div className="relative overflow-hidden">
        <div className="relative aspect-[2/3] overflow-hidden rounded-[16px]">
          <Image
            src={image}
            alt={movie.name}
            fill
            className="object-cover transition duration-900 ease-out group-hover:scale-[1.05] bg-black/10"
            sizes="200px"
            unoptimized
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent hover:opacity-0 transition duration-500 ease-in-out" />

          {(movie.episode_current || movie.year) && (
            <span className="absolute bottom-2 left-2 rounded-md bg-black/75 px-2 py-1 text-[10px] font-bold text-white">
              {movie.episode_current || movie.year}
            </span>
          )}
        </div>

        <div className="py-3 text-center">
          <h3 className="line-clamp-1 text-base font-bold leading-tight text-white/80 hover:text-white">
            {movie.name}
          </h3>
          <p className="mt-1 line-clamp-1 text-sm text-slate-400 hover:text-slate-300">
            {movie.origin_name || ""}
          </p>
        </div>
      </div>
    </Link>
  );
}