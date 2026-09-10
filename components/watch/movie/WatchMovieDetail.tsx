"use client";

import Link from "next/link";
import WatchMovieDetailSkeleton from "@/components/watch/movie/WatchMovieDetailSkeleton";
import WatchMovieInfo from "@/components/watch/movie/WatchMovieInfo";
import { useWatchMovie } from "@/hooks/watch/useWatchMovie";
import { WatchApiError, watchApiErrorMessage } from "@/types/watchApi";

function detailErrorMessage(error: unknown): string {
  if (error instanceof WatchApiError && error.code === "http_error" && error.details.status === 404) {
    return "NguồnC không còn phim này hoặc đường dẫn phim chưa đúng.";
  }

  return watchApiErrorMessage(error);
}

export default function WatchMovieDetail({ slug }: { slug: string }) {
  const query = useWatchMovie(slug);

  if (query.isPending) {
    return <WatchMovieDetailSkeleton />;
  }

  if (query.isError || !query.data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 pt-24 pb-12 text-foreground">
        <section className="w-full max-w-xl rounded-3xl border border-border bg-card p-7 shadow-sm sm:p-9" role="status">
          <i className="fad fa-cloud-exclamation text-3xl text-muted-foreground" aria-hidden="true" />
          <p className="m-0 mt-5 text-xs font-bold tracking-[.16em] text-muted-foreground">WATCH · CHI TIẾT PHIM</p>
          <h1 className="m-0 mt-3 text-2xl font-bold sm:text-3xl">Chưa tải được phim</h1>
          <p className="m-0 mt-3 leading-7 text-muted-foreground">{detailErrorMessage(query.error)}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <button
              type="button"
              disabled={query.isFetching}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
              onClick={() => {
                if (!query.isFetching) void query.refetch({ cancelRefetch: false });
              }}
            >
              <i className={query.isFetching ? "fad fa-spinner-third fa-spin" : "fad fa-rotate-right"} aria-hidden="true" />
              {query.isFetching ? "Đang tải…" : "Thử lại"}
            </button>

            <Link
              href="/watch"
              prefetch={false}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold text-foreground no-underline hover:bg-accent"
            >
              <i className="fad fa-arrow-left" aria-hidden="true" />
              Về Watch
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return <WatchMovieInfo movie={query.data} />;
}
