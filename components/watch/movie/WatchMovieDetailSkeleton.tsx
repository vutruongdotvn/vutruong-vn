const BLOCK = "animate-pulse bg-skeleton";

function Line({
  className,
}: {
  className: string;
}) {
  return <div className={`${BLOCK} rounded-lg ${className}`} />;
}

function Pill({
  className = "h-8 w-20",
}: {
  className?: string;
}) {
  return <div className={`${BLOCK} rounded-full ${className}`} />;
}

function DetailFactSkeleton({
  pills = false,
}: {
  pills?: boolean;
}) {
  return (
    <div className="border-t border-border/80 pt-4">
      <Line className="h-3 w-20" />

      {pills ? (
        <div className="mt-2 flex flex-wrap gap-2">
          <Pill className="h-8 w-20" />
          <Pill className="h-8 w-24" />
        </div>
      ) : (
        <Line className="mt-2 h-4 w-[min(100%,11rem)]" />
      )}
    </div>
  );
}

function EpisodeListSkeleton() {
  return (
    <section aria-hidden="true">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Line className="h-3 w-28" />
          <Line className="mt-2 h-8 w-44 sm:h-9" />
          <Line className="mt-2 h-4 w-52" />
        </div>
      </div>

      <div className="mt-7 flex flex-wrap gap-2">
        {Array.from({ length: 16 }, (_, index) => (
          <Pill
            key={index}
            className={[
              "h-10",
              index % 5 === 0
                ? "w-28"
                : index % 3 === 0
                  ? "w-24"
                  : "w-20",
            ].join(" ")}
          />
        ))}
      </div>
    </section>
  );
}

/**
 * Structural 1:1 mirror of WatchMovieInfo.
 *
 * Content-dependent text lengths / optional fields cannot be known before the
 * movie query resolves, but every major container, breakpoint, spacing rule,
 * column, action area, metadata grid and episode section follows the rendered
 * component's current layout.
 */
export default function WatchMovieDetailSkeleton() {
  return (
    <main
      className="min-h-screen bg-background text-foreground"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Đang tải thông tin phim…</span>

      <article
        className={[
          "relative isolate overflow-hidden",
          "pt-36 pb-16 sm:pt-44 sm:pb-20",
          "lg:pt-[clamp(18rem,31vh,24rem)] lg:pb-24",
        ].join(" ")}
      >
        {/* Same visual footprint as the real backdrop region. */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(62rem,100svh)] overflow-hidden bg-surface max-[47.99rem]:h-[34rem]"
          aria-hidden="true"
        >
          <div className="absolute inset-0 animate-pulse bg-skeleton/70" />

          <div
            className={[
              "absolute inset-0",
              "bg-gradient-to-t from-[var(--background)] from-0%",
              "via-[color-mix(in_srgb,var(--background)_92%,transparent)] via-30%",
              "to-transparent to-78%",
              "max-[47.99rem]:via-[color-mix(in_srgb,var(--background)_94%,transparent)]",
              "max-[47.99rem]:via-40% max-[47.99rem]:to-82%",
            ].join(" ")}
          />

          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/12 to-transparent dark:from-black/24" />
        </div>

        <div
          className={[
            "relative z-2 mx-auto grid w-[min(calc(100%_-_2rem),76rem)] gap-8",
            "sm:w-[min(calc(100%_-_3rem),76rem)]",
            "md:grid-cols-[13rem_minmax(0,1fr)] md:items-start",
            "lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12",
          ].join(" ")}
        >
          {/* Poster column — same width/radius and desktop offset as WatchMovieInfo. */}
          <aside className="md:pt-10">
            <div
              className={[
                BLOCK,
                "aspect-[2/3] w-[min(42vw,11rem)] rounded-[1.35rem]",
                "shadow-[0_24px_70px_rgb(0_0_0/12%)]",
                "md:w-full md:rounded-[1.6rem]",
              ].join(" ")}
            />

            {/* Desktop-only movie synopsis mirrors the real aside. */}
            <div className="mt-5 hidden md:block">
              <Line className="h-3 w-28" />
              <div className="mt-3 space-y-2.5">
                <Line className="h-4 w-full" />
                <Line className="h-4 w-[96%]" />
                <Line className="h-4 w-[90%]" />
                <Line className="h-4 w-[82%]" />
                <Line className="h-4 w-[68%]" />
              </div>
            </div>
          </aside>

          {/* Main movie column. */}
          <div className="min-w-0 max-w-4xl">
            {/* Back pill */}
            <Pill className="h-8 w-28" />

            {/* Movie name / original name */}
            <Line className="mt-5 h-10 w-[min(100%,34rem)] sm:h-12" />
            <Line className="mt-3 h-5 w-[min(78%,22rem)] sm:h-6" />

            {/* Badges */}
            <div className="mt-6 flex flex-wrap gap-2">
              <Pill className="h-7 w-14" />
              <Pill className="h-7 w-20" />
              <Pill className="h-7 w-14" />
              <Pill className="h-7 w-24" />
              <Pill className="h-7 w-20" />
            </div>

            {/* Mobile-only synopsis mirrors the real md:hidden block. */}
            <div className="mt-6 md:hidden">
              <Line className="h-3 w-28" />
              <div className="mt-3 space-y-2.5">
                <Line className="h-4 w-full" />
                <Line className="h-4 w-[94%]" />
                <Line className="h-4 w-[86%]" />
                <Line className="h-4 w-[70%]" />
              </div>
            </div>

            {/* Watch + trailer buttons */}
            <div className="mt-7 flex flex-wrap items-start gap-3">
              <Pill className="h-12 w-32" />
              <Pill className="h-12 w-36" />
            </div>

            {/* Same 1 → 2 → 3-column fact grid as the rendered UI. */}
            <dl className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
              <DetailFactSkeleton pills />
              <DetailFactSkeleton pills />
              <DetailFactSkeleton pills />

              <DetailFactSkeleton />
              <DetailFactSkeleton />
              <DetailFactSkeleton />
              <DetailFactSkeleton />
              <DetailFactSkeleton />
              <DetailFactSkeleton />
              <DetailFactSkeleton />
              <DetailFactSkeleton />
            </dl>

            {/* Episode list lives inside the main column in the real detail UI. */}
            <div className="mt-12 border-t border-border pt-10 sm:mt-14">
              <EpisodeListSkeleton />
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}
