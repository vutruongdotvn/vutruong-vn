const BLOCK = "animate-pulse rounded-lg bg-skeleton";

export default function WatchMoviePlayerSkeleton() {
  return (
    <main className="min-h-screen bg-background px-4 pt-24 pb-16 text-foreground sm:px-6" aria-busy="true">
      <span className="sr-only">Đang chuẩn bị trình phát…</span>

      <div className="mx-auto w-full max-w-6xl">
        <div className={`h-4 w-44 ${BLOCK}`} />
        <div className={`mt-5 h-10 w-[min(100%,32rem)] ${BLOCK}`} />
        <div className={`mt-3 h-5 w-64 ${BLOCK}`} />

        <div className={`mt-8 aspect-video w-full rounded-3xl ${BLOCK}`} />

        <div className="mt-7 flex flex-wrap gap-2">
          {[1, 2].map(item => (
            <div key={item} className={`h-10 w-32 rounded-full ${BLOCK}`} />
          ))}
        </div>

        <div className="mt-14 border-t border-border pt-10">
          <div className={`h-8 w-48 ${BLOCK}`} />
          <div className={`mt-3 h-4 w-72 max-w-full ${BLOCK}`} />
          <div className="mt-7 flex flex-wrap gap-2">
            {Array.from({ length: 12 }, (_, index) => (
              <div key={index} className={`h-10 w-20 rounded-full ${BLOCK}`} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
