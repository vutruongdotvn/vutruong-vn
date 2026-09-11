import WatchMovieCard from "@/components/watch/WatchMovieCard";
import type { WatchListMovie } from "@/types/watchApi";

/** Reuses the row's data; this component does not subscribe or fetch. */
export default function WatchGrid({ movies, label }: { movies: ReadonlyArray<WatchListMovie>; label: string }) {
  return (
    <ul
      className={[
        "m-0 grid list-none grid-cols-2 gap-1.25 gap-y-6 p-0",
        "[&>li]:min-w-0",
        "min-[30rem]:grid-cols-3",
        "min-[40rem]:grid-cols-4 min-[40rem]:gap-x-2 min-[40rem]:gap-y-7",
        "min-[60rem]:grid-cols-5 min-[75rem]:grid-cols-5 min-[96rem]:grid-cols-5",
      ].join(" ")}
      aria-label={label}
      data-watch-grid
    >
      {movies.map(movie => (
        <li key={movie.slug}>
          <WatchMovieCard movie={movie} />
        </li>
      ))}
    </ul>
  );
}
