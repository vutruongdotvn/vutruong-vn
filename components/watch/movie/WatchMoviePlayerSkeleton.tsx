const BLOCK = "animate-pulse bg-skeleton";

function Line({ className }: { className: string }) {
  return <div className={`${BLOCK} rounded-lg ${className}`} />;
}

function Chip({ className = "h-8 w-20" }: { className?: string }) {
  return <div className={`${BLOCK} rounded-md ${className}`} />;
}

/**
 * 1:1 structural mirror of the cinematic player detail layout.
 *
 * The real page starts with movie details collapsed, so the loading skeleton
 * intentionally mirrors that default state 1:1. The grouped metadata panels
 * (Thể loại / Quốc gia / Phát hành / Thông tin phim) only mount after the user
 * presses "Xem thêm", when loading has already finished.
 */
export default function WatchMoviePlayerSkeleton() {
  return (
    <main
      className="min-h-screen bg-background text-foreground"
      aria-busy="true"
      aria-live="polite"
    >
      <span className="sr-only">Đang chuẩn bị trình phát…</span>

      <section className="bg-[#0a0d11] px-3 pt-24 pb-4 sm:px-5 sm:pt-25 sm:pb-5">
        <div className="mx-auto w-full max-w-[80rem]">
          <div className="aspect-video w-full animate-pulse rounded-3xl border border-white/10 bg-black/75" />
        </div>
      </section>

      <div className="mx-auto w-full max-w-[80rem] px-4 pt-8 pb-16 sm:px-6 sm:pt-10">
        <section className="grid items-start gap-7 md:grid-cols-[11rem_minmax(0,1fr)] lg:grid-cols-[12rem_minmax(0,1fr)]">
          <div className="mx-auto w-36 md:mx-0 md:w-full">
            <div className={`${BLOCK} aspect-[2/3] rounded-xl shadow-[0_18px_50px_rgb(0_0_0/10%)]`} />
          </div>

          <div className="min-w-0">
            <Line className="h-10 w-[min(88%,34rem)] sm:h-12" />
            <Line className="mt-3 h-5 w-[min(65%,20rem)]" />

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip className="h-7 w-14" />
              <Chip className="h-7 w-14" />
              <Chip className="h-7 w-20" />
              <Chip className="h-7 w-20" />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Chip className="h-8 w-20" />
              <Chip className="h-8 w-24" />
            </div>

            <div className="mt-5">
              <div className={`${BLOCK} h-9 w-44 rounded-full`} />
            </div>

            <div className="mt-6 max-w-5xl space-y-2.5">
              <Line className="h-4 w-full" />
              <Line className="h-4 w-[82%]" />
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              <div className={`${BLOCK} h-12 w-20 rounded-xl border border-border`} />
              <div className={`${BLOCK} h-12 w-32 rounded-xl border border-border`} />
            </div>
          </div>
        </section>

        <section className="mt-12" aria-hidden="true">
          <div className="flex flex-wrap items-center justify-between gap-5">
            <div className="flex items-center gap-3">
              <Line className="h-6 w-6" />
              <Line className="h-8 w-40" />
            </div>

            <div className="flex items-center gap-3">
              <Line className="h-4 w-20" />
              <div className={`${BLOCK} h-11 w-48 rounded-xl`} />
            </div>
          </div>

          <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
            <Line className="h-5 w-44" />
            <div className="flex items-center gap-3">
              <Line className="h-4 w-12" />
              <div className={`${BLOCK} h-7 w-12 rounded-full`} />
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <div className={`${BLOCK} h-10 w-44 rounded-lg`} />
            <div className={`${BLOCK} h-10 w-36 rounded-lg`} />
            <div className={`${BLOCK} h-10 w-40 rounded-lg`} />
          </div>

          <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {Array.from({ length: 24 }, (_, index) => (
              <div
                key={index}
                className={`${BLOCK} h-12 rounded-xl`}
              />
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
