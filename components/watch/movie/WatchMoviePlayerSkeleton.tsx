const BLOCK = "animate-pulse bg-skeleton";

function Line({ className }: { className: string }) {
  return <div className={`${BLOCK} rounded-lg ${className}`} />;
}

function EpisodeSkeletons() {
  return (
    <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
      {Array.from({ length: 8 }, (_, index) => (
        <div
          key={index}
          className={`${BLOCK} h-12 rounded-xl border border-border/55`}
        />
      ))}
    </div>
  );
}

/**
 * Structural mirror of WatchMoviePlayer's default (collapsed) state.
 *
 * Keep this component aligned with the real player layout only. Dynamic blocks
 * that do not always exist (alternate servers and expanded metadata panels) are
 * intentionally omitted to avoid skeleton-only layout shifts.
 */
export default function WatchMoviePlayerSkeleton() {
  return (
    <main
      className="min-h-screen bg-background text-foreground"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Đang chuẩn bị trình phát…</span>

      {/* Mirrors the real theater exactly: same wrapper, width and aspect ratio. */}
      <section className="bg-[#0a0d11] pt-14">
        <div className="mx-auto w-full max-w-[80rem]">
          <div className="aspect-video w-full bg-black" />
        </div>
      </section>

      {/* Same spacing as WatchMoviePlayer's content container. */}
      <div className="mx-auto w-full max-w-[80rem] px-4 pt-5 pb-24 md:pb-8 sm:px-6 sm:pt-6">
        <section className="grid items-start gap-7 md:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-[12rem_minmax(0,1fr)]">
          {/* Real artwork is hidden below md, so the skeleton follows it 1:1. */}
          <div className="mx-auto hidden w-36 md:mx-0 md:block md:w-full">
            <div
              className={`${BLOCK} aspect-[2/3] overflow-hidden rounded-xl shadow-[0_18px_50px_rgb(0_0_0/18%)]`}
            />
          </div>

          <div className="min-w-0">
            {/* Movie identity */}
            <Line className="h-7 w-[min(88%,34rem)] sm:h-9" />
            <Line className="mt-2 h-5 w-[min(62%,20rem)]" />

            {/* Nội dung phim: same card, padding, radius and spacing as the real UI. */}
            <div className="mt-3 max-w-5xl rounded-xl border border-border bg-white/75 p-3 backdrop-blur-md dark:border-border/50 dark:bg-card sm:p-4">
              <Line className="h-4 w-28" />

              <div className="mt-2 space-y-2.5">
                <Line className="h-4 w-full" />
                <Line className="h-4 w-[96%]" />
                <Line className="h-4 w-[78%]" />
              </div>
            </div>

            {/* Same two controls visible while details are collapsed. */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <div className={`${BLOCK} h-12 w-[7.5rem] rounded-xl border border-border/55`} />
              <div className={`${BLOCK} h-12 w-32 rounded-xl border border-border/55`} />
            </div>

            {/* Episode list belongs inside the right content column in the real UI. */}
            <section className="mt-12" aria-hidden="true">
              <div className="flex flex-wrap items-center justify-between gap-5">
                <Line className="h-6 w-44 sm:h-7 sm:w-52" />
              </div>

              <EpisodeSkeletons />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}