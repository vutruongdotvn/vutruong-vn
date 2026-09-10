const BLOCK = "animate-pulse rounded-lg bg-skeleton";

/** Mirrors the final detail composition so data arrival does not shift layout. */
export default function WatchMovieDetailSkeleton() {
  return (
    <main className="min-h-screen bg-background text-foreground" aria-busy="true" aria-live="polite">
      <span className="sr-only">Đang tải thông tin phim…</span>

      <section className="relative isolate flex min-h-[max(52rem,100svh)] items-end overflow-hidden pt-28 pb-16 md:pb-20">
        <div className="absolute inset-0 bg-skeleton/70" aria-hidden="true" />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background from-0% via-background/90 via-28% to-background/10 to-100%"
          aria-hidden="true"
        />

        <div className="relative z-1 mx-auto grid w-[min(calc(100%_-_2rem),76rem)] gap-8 sm:w-[min(calc(100%_-_3rem),76rem)] md:grid-cols-[minmax(12rem,16rem)_minmax(0,1fr)] md:items-end lg:gap-12">
          <div className={`aspect-[2/3] w-[min(46vw,13rem)] rounded-3xl md:w-full ${BLOCK}`} />

          <div className="max-w-3xl">
            <div className={`h-3 w-40 ${BLOCK}`} />
            <div className={`mt-5 h-12 w-[min(100%,38rem)] ${BLOCK}`} />
            <div className={`mt-4 h-5 w-64 ${BLOCK}`} />

            <div className="mt-6 flex flex-wrap gap-2">
              {[1, 2, 3, 4, 5].map(item => (
                <div key={item} className={`h-8 w-20 ${BLOCK}`} />
              ))}
            </div>

            <div className="mt-6 space-y-3">
              <div className={`h-4 w-full ${BLOCK}`} />
              <div className={`h-4 w-[94%] ${BLOCK}`} />
              <div className={`h-4 w-[72%] ${BLOCK}`} />
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <div className={`h-12 w-36 rounded-full ${BLOCK}`} />
              <div className={`h-12 w-36 rounded-full ${BLOCK}`} />
            </div>

            <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map(item => (
                <div key={item} className="space-y-2 border-t border-border pt-4">
                  <div className={`h-3 w-20 ${BLOCK}`} />
                  <div className={`h-4 w-4/5 ${BLOCK}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-[min(calc(100%_-_2rem),76rem)] py-12 sm:w-[min(calc(100%_-_3rem),76rem)]">
        <div className={`h-8 w-48 ${BLOCK}`} />
        <div className={`mt-3 h-4 w-72 max-w-full ${BLOCK}`} />
        <div className="mt-7 flex flex-wrap gap-2">
          {Array.from({ length: 12 }, (_, index) => (
            <div key={index} className={`h-10 w-20 rounded-full ${BLOCK}`} />
          ))}
        </div>
      </section>
    </main>
  );
}
