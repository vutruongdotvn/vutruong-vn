export default function Loading() {
  return (
    <main className="min-h-screen px-3 pb-28 pt-24 sm:px-5 md:pb-10 md:pt-28">
      <div className="mx-auto w-full max-w-6xl animate-pulse overflow-hidden rounded-2xl border border-border bg-card sm:rounded-3xl">
        <div className="border-b border-border p-6 sm:p-10">
          <div className="mb-6 size-20 rounded-3xl bg-skeleton" />
          <div className="mb-3 h-9 w-2/3 max-w-md rounded-xl bg-skeleton" />
          <div className="h-5 w-1/2 max-w-sm rounded-lg bg-skeleton" />
        </div>

        <div className="grid gap-8 p-6 sm:p-10 lg:grid-cols-[0.78fr_1.45fr]">
          <div className="space-y-4">
            <div className="h-10 w-3/4 rounded-xl bg-skeleton" />
            <div className="h-10 w-full rounded-xl bg-skeleton" />
            <div className="h-10 w-2/3 rounded-xl bg-skeleton" />
            <div className="h-10 w-5/6 rounded-xl bg-skeleton" />
          </div>
          <div className="space-y-6">
            {[1, 2, 3].map((item) => (
              <div key={item} className="rounded-2xl border border-border p-5">
                <div className="mb-3 h-5 w-1/3 rounded-lg bg-skeleton" />
                <div className="mb-2 h-6 w-3/4 rounded-lg bg-skeleton" />
                <div className="h-4 w-full rounded-lg bg-skeleton" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
