const BLOCK = "animate-pulse bg-skeleton motion-reduce:animate-none";

function Line({ className }: { className: string }) {
  return <div className={`${BLOCK} rounded-lg ${className}`} />;
}

function Pill({ className = "h-8 w-20" }: { className?: string }) {
  return <div className={`${BLOCK} rounded-lg ${className}`} />;
}

function LabelSkeleton({ width = "w-20" }: { width?: string }) {
  return (
    <div className="flex h-4 items-center">
      <Line className={`h-2.5 ${width}`} />
    </div>
  );
}

function ParagraphSkeleton({
  widths,
}: {
  widths: ReadonlyArray<string>;
}) {
  return (
    <div>
      {widths.map((width, index) => (
        <div key={`${width}-${index}`} className="flex h-6 items-center">
          <Line className={`h-3.5 ${width}`} />
        </div>
      ))}
    </div>
  );
}

function DetailGroupSkeleton({
  widths,
}: {
  widths: ReadonlyArray<string>;
}) {
  return (
    <div className="border-t border-border/80 pt-4">
      <LabelSkeleton />

      <div className="mt-2 flex flex-wrap gap-2">
        {widths.map((width, index) => (
          <Pill key={`${width}-${index}`} className={`h-8 ${width}`} />
        ))}
      </div>
    </div>
  );
}

function DetailFactSkeleton({
  width = "w-[min(100%,11rem)]",
}: {
  width?: string;
}) {
  return (
    <div className="border-t border-border/80 pt-4">
      <LabelSkeleton />

      <div className="mt-1.5 flex h-6 items-center">
        <Line className={`h-3.5 ${width}`} />
      </div>
    </div>
  );
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
      className={`${BLOCK} inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border border-border px-5 text-sm font-semibold`}
      aria-hidden="true"
    >
      <i className={`${icon} invisible`} aria-hidden="true" />
      <span className="invisible">{label}</span>
    </div>
  );
}

function EpisodeListSkeleton() {
  return (
    <section aria-hidden="true">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          {/* WatchEpisodeList: mt-2 text-lg leading-7 -> sm:text-2xl leading-8. */}
          <div className="mt-2 flex h-7 items-center sm:h-8">
            <Line className="h-[1.125rem] w-36 sm:h-[1.375rem] sm:w-44" />
          </div>

          <div className="mt-2 flex h-6 items-center">
            <Line className="h-3.5 w-52" />
          </div>
        </div>
      </div>

      <nav className="mt-7 grid grid-cols-3 sm:grid-cols-4 gap-1" aria-hidden="true">
        {Array.from({ length: 18 }, (_, index) => (
          <Pill
            key={index}
            className={[
              "h-10",
              index % 6 === 0
                ? "w-full"
                : index % 4 === 0
                  ? "w-full"
                  : "w-full",
            ].join(" ")}
          />
        ))}
      </nav>
    </section>
  );
}

/**
 * Loading state for WatchMovieInfo.
 *
 * Container widths, breakpoints, spacing, poster geometry, detail card styling,
 * metadata grid and episode-list structure intentionally mirror the real UI.
 * Data-dependent text wrapping, optional fields and episode count cannot be
 * known until the movie request resolves, so only those intrinsic lengths are
 * represented by stable placeholders.
 */
export default function WatchMovieDetailSkeleton() {
  return (
    <main
      className="min-h-screen bg-background text-foreground pt-14"
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
        <div
          className="pointer-events-none absolute inset-x-0 top-0 z-0 h-[min(62rem,100svh)] overflow-hidden bg-surface max-[47.99rem]:h-[34rem]"
          aria-hidden="true"
        >
          <div className="absolute inset-0 animate-pulse bg-skeleton/65 motion-reduce:animate-none" />

          <div
            className="absolute inset-0 mix-blend-multiply opacity-[.24] dark:opacity-[.3] max-[47.99rem]:opacity-[.18] max-[47.99rem]:dark:opacity-[.23]"
            style={{
              backgroundImage: [
                "repeating-linear-gradient(to right, rgba(0,0,0,0.34) 0 1px, transparent 1px 4px)",
                "repeating-linear-gradient(to bottom, rgba(0,0,0,0.28) 0 1px, transparent 1px 4px)",
              ].join(", "),
            }}
          />

          <div
            className="absolute inset-0 mix-blend-multiply opacity-[.18] dark:opacity-[.24] max-[47.99rem]:opacity-[.14] max-[47.99rem]:dark:opacity-[.18]"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.72) 0 0.72px, rgba(0,0,0,0.2) 0.73px 1.1px, transparent 1.15px)",
              backgroundSize: "4px 4px",
            }}
          />

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
            "relative z-2 mx-auto grid w-[min(calc(100%_-_2rem),72rem)] gap-8",
            "sm:w-[min(calc(100%_-_3rem),72rem)]",
            "md:grid-cols-[13rem_minmax(0,1fr)] md:items-start",
            "lg:grid-cols-[15rem_minmax(0,1fr)]",
          ].join(" ")}
        >
          <aside className="posterCol">
            <div
              className={[
                BLOCK,
                "aspect-[2/3] w-[min(42vw,11rem)] overflow-hidden rounded-[1.35rem]",
                "shadow-[0_24px_70px_rgb(0_0_0/25%)]",
                "md:w-full md:rounded-[1.6rem]",
              ].join(" ")}
            />

            <div className="mt-5 hidden md:block">
              <LabelSkeleton width="w-28" />

              <div className="mt-3">
                <ParagraphSkeleton
                  widths={[
                    "w-full",
                    "w-full",
                    "w-full",
                  ]}
                />
              </div>
            </div>
          </aside>

          <div className="min-w-0 backdrop-blur-md p-3 md:p-5 lg:p-7 rounded-3xl border border-border/25 bg-card/20">
            {/* One-line title footprint; actual wrapping remains data-dependent. */}
            <div className="flex h-[clamp(1.7rem,5.675vw,2.27rem)] items-center">
              <Line className="h-[68%] w-[min(100%,34rem)]" />
            </div>

            {/* originalName is optional in the real UI. */}
            <div className="mt-3 flex h-7 items-center">
              <Line className="h-4 w-[min(78%,22rem)] sm:h-[1.125rem]" />
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Pill className="h-7 w-14" />
              <Pill className="h-7 w-20" />
              <Pill className="h-7 w-14" />
              <Pill className="h-7 w-24" />
              <Pill className="h-7 w-20" />
            </div>

            <div className="mt-6 md:hidden">
              <LabelSkeleton width="w-28" />

              <div className="mt-3">
                <ParagraphSkeleton
                  widths={[
                    "w-full",
                    "w-[97%]",
                    "w-[93%]",
                    "w-[88%]",
                    "w-[81%]",
                    "w-[69%]",
                  ]}
                />
              </div>
            </div>

            <div className="mt-7 flex flex-wrap items-start gap-3">
              <ActionSkeleton label="Xem phim" icon="fad fa-play" />
              <ActionSkeleton label="Xem Trailer" icon="fad fa-play-circle" />
            </div>

            <dl className="mt-10 grid gap-x-8 gap-y-4 sm:grid-cols-2 xl:grid-cols-3">
              <DetailGroupSkeleton widths={["w-20", "w-24"]} />
              <DetailGroupSkeleton widths={["w-20", "w-24"]} />
              <DetailGroupSkeleton widths={["w-20", "w-24"]} />

              <DetailFactSkeleton width="w-24" />
              <DetailFactSkeleton width="w-16" />
              <DetailFactSkeleton width="w-28" />
              <DetailFactSkeleton width="w-[min(100%,10rem)]" />
              <DetailFactSkeleton width="w-full" />
              <DetailFactSkeleton width="w-28" />
              <DetailFactSkeleton width="w-24" />
              <DetailFactSkeleton width="w-24" />
            </dl>

            <div className="mt-12 border-t border-border pt-10 sm:mt-14">
              <EpisodeListSkeleton />
            </div>
          </div>
        </div>
      </article>
    </main>
  );
}