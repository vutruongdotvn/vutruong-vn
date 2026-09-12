const BLOCK = "animate-pulse bg-skeleton motion-reduce:animate-none";

function Line({ className }: { className: string }) {
  return <div className={`${BLOCK} rounded-lg ${className}`} />;
}

function ActionSkeleton({
  label,
  icon,
}: {
  label: string;
  icon: string;
}) {
  return (
    <div
      className={`${BLOCK} inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-border/55 px-6 text-sm font-semibold`}
      aria-hidden="true"
    >
      <i className={`${icon} invisible text-xs`} aria-hidden="true" />
      <span className="invisible">{label}</span>
    </div>
  );
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
 * Structural mirror of WatchMoviePlayer's initial collapsed state.
 *
 * The theater, 72rem content container, responsive paddings, poster grid,
 * controls and episode grid match the real component. Blocks whose existence
 * depends on fetched data (poster availability, alternate servers, episode
 * count and intrinsic text wrapping) cannot be known before the query resolves.
 */
export default function WatchMoviePlayerSkeleton() {
  return (
    <main
      className="min-h-screen bg-background text-foreground"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Đang chuẩn bị trình phát…</span>

      <section className="bg-[#0a0d11] pt-14">
        <div className="mx-auto w-full max-w-[90rem]">
          {/* WatchRemotePlayer itself is exactly aspect-video. */}
          <div className="aspect-video w-full bg-black" />
        </div>
      </section>

      <div className="mx-auto w-full max-w-[72rem] px-4 pt-5 pb-24 md:pb-8 sm:px-6 sm:pt-6">
        <section className="grid items-start gap-7 md:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-[12rem_minmax(0,1fr)]">
          {/* Mirrors the common showArtwork && thumbUrl branch. */}
          <div className="mx-auto w-36 md:mx-0 md:w-full hidden md:block">
            <div
              className={`${BLOCK} aspect-[2/3] overflow-hidden rounded-xl shadow-[0_18px_50px_rgb(0_0_0/18%)]`}
            />
          </div>

          <div className="min-w-0">
            {/* h1: text-[clamp(1.5rem,3vw,2rem)] + leading-[1.15]. */}
            <div className="flex h-[clamp(1.725rem,3.45vw,2.3rem)] items-center">
              <Line className="h-[68%] w-[min(88%,34rem)]" />
            </div>

            {/* originalName: text-sm -> sm:text-base. */}
            <div className="mt-2 flex h-5 items-center sm:h-6">
              <Line className="h-3.5 w-[min(62%,20rem)] sm:h-4" />
            </div>

            {/* Same description card geometry as the real <p>. */}
            <div className="mt-3 max-w-5xl rounded-xl border border-border bg-white/75 p-3 text-sm leading-6 backdrop-blur-md dark:border-border/50 dark:bg-card sm:p-4 sm:text-[.9375rem] sm:leading-6">
              <div className="mb-1.5 flex h-5 items-center">
                <Line className="h-3.5 w-28" />
              </div>

              <div>
                <div className="flex h-6 items-center">
                  <Line className="h-3.5 w-full" />
                </div>
                <div className="flex h-6 items-center">
                  <Line className="h-3.5 w-[97%]" />
                </div>
                <div className="flex h-6 items-center">
                  <Line className="h-3.5 w-[92%]" />
                </div>
                <div className="flex h-6 items-center">
                  <Line className="h-3.5 w-[78%]" />
                </div>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <ActionSkeleton label="Quay lại" icon="fad fa-arrow-left" />
              <ActionSkeleton label="Xem thêm" icon="fad fa-expand" />
            </div>

            {/* detailsExpanded starts false, so expanded InfoPanels are omitted. */}
            <section className="mt-12" aria-hidden="true">
              <div className="flex flex-wrap items-center justify-between gap-5">
                {/* h2: text-base -> sm:text-xl. */}
                <div className="flex h-6 items-center sm:h-7">
                  <Line className="h-4 w-40 sm:h-5 sm:w-48" />
                </div>
              </div>

              {/* Alternate-source controls are data-dependent and intentionally omitted. */}
              <EpisodeSkeletons />
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}