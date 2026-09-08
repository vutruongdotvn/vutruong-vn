export default function Loading() {
  return (
    <main className="min-h-screen px-3 pb-28 pt-20 sm:px-5 sm:pt-24 md:pb-10">
      <div className="mx-auto w-full max-w-6xl animate-pulse">
        <div className="mb-5 flex min-h-11 justify-end">
          <div className="h-12 w-40 rounded-[1.1rem] border border-border bg-card" />
        </div>

        <div className="space-y-6">
          {/* <header className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7">
            <div className="flex items-center gap-5 sm:gap-7">
              <div className="size-20 shrink-0 rounded-[1.55rem] bg-[#111216] sm:size-24" />
              <div className="min-w-0 flex-1 space-y-3">
                <div className="h-2.5 w-44 rounded-full bg-skeleton" />
                <div className="h-9 w-64 max-w-full rounded-xl bg-skeleton sm:h-11" />
                <div className="h-3 w-56 max-w-full rounded-full bg-skeleton" />
              </div>
              <div className="hidden h-14 w-48 rounded-2xl bg-skeleton lg:block" />
            </div>
          </header>
 */}
          <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <header className="bg-[#111216] px-5 pb-20 pt-6 sm:px-8 sm:pb-24 sm:pt-8 lg:px-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-xl bg-white/10" />
                  <div className="space-y-2">
                    <div className="h-2 w-28 rounded-full bg-white/10" />
                    <div className="h-2.5 w-36 rounded-full bg-white/15" />
                  </div>
                </div>
                <div className="hidden h-2.5 w-24 rounded-full bg-white/10 sm:block" />
              </div>

              <div className="mt-9 space-y-3 lg:pl-[13.5rem]">
                <div className="h-5 w-24 rounded-full bg-white/10" />
                <div className="h-11 w-3/4 max-w-xl rounded-xl bg-white/15" />
                <div className="h-4 w-2/3 max-w-md rounded-full bg-white/10" />
              </div>
            </header>

            <section className="px-5 pb-6 sm:px-8 sm:pb-8 lg:px-10">
              <div className="grid gap-7 lg:grid-cols-[11.5rem_minmax(0,1fr)] lg:gap-9">
                <div className="-mt-14 aspect-[4/5] w-36 rounded-2xl border-[6px] border-card bg-skeleton shadow-lg sm:-mt-16 sm:w-40 lg:-mt-24 lg:w-[11.5rem]" />

                <div className="space-y-7 pt-1 lg:pt-6">
                  <div>
                    <div className="mb-5 flex items-center gap-4">
                      <div className="size-12 rounded-2xl bg-skeleton" />
                      <div className="space-y-2">
                        <div className="h-2.5 w-28 rounded-full bg-skeleton" />
                        <div className="h-6 w-40 rounded-lg bg-skeleton" />
                      </div>
                    </div>
                    <div className="space-y-2.5 border-l-2 border-border pl-5">
                      <div className="h-3.5 w-full rounded-full bg-skeleton" />
                      <div className="h-3.5 w-11/12 rounded-full bg-skeleton" />
                      <div className="h-3.5 w-4/5 rounded-full bg-skeleton" />
                    </div>
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="mb-4 h-8 w-52 rounded-lg bg-skeleton" />
                    <div className="grid gap-3 md:grid-cols-3">
                      {[1, 2, 3].map((item) => (
                        <div
                          key={item}
                          className="h-24 rounded-[1.25rem] border border-border bg-muted/20"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </section>

          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.38fr)_minmax(330px,0.62fr)]">
            <div className="space-y-6">
              {[2, 3, 4].map((sectionNumber) => (
                <SectionSkeleton
                  key={sectionNumber}
                  entries={sectionNumber === 2 ? 3 : 2}
                />
              ))}
            </div>

            <div className="space-y-6">
              <SectionSkeleton entries={3} compact />
              <SectionSkeleton entries={4} compact />
            </div>
          </div>

          <footer className="flex items-center gap-4 rounded-[1.5rem] border border-border bg-card px-5 py-4 shadow-sm sm:px-6">
            <div className="size-10 rounded-xl bg-[#111216]" />
            <div className="flex-1 space-y-2">
              <div className="h-2 w-24 rounded-full bg-skeleton" />
              <div className="h-3.5 w-36 rounded-full bg-skeleton" />
            </div>
            <div className="hidden h-8 w-28 rounded-lg bg-skeleton sm:block" />
          </footer>
        </div>
      </div>
    </main>
  );
}

function SectionSkeleton({
  entries,
  compact = false,
}: {
  entries: number;
  compact?: boolean;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <header className="flex items-center gap-4 bg-[#111216] px-5 py-5 sm:px-7 sm:py-6">
        <div className="size-12 shrink-0 rounded-2xl bg-white/10" />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-2 w-28 rounded-full bg-white/10" />
          <div className="h-6 w-48 max-w-full rounded-lg bg-white/15" />
        </div>
        <div className="hidden h-9 w-8 rounded-lg bg-white/10 sm:block" />
      </header>

      <div className="space-y-4 p-5 sm:p-7">
        {Array.from({ length: entries }, (_, index) => (
          <div
            key={index}
            className={
              compact
                ? "rounded-[1.4rem] border border-border bg-muted/15 p-4"
                : "ml-12 rounded-[1.5rem] border border-border bg-muted/15 p-5"
            }
          >
            <div className="mb-3 flex items-center gap-2">
              <div className="h-2.5 w-7 rounded-full bg-skeleton" />
              <div className="h-2.5 w-20 rounded-full bg-skeleton" />
            </div>
            <div className="mb-3 h-5 w-3/4 rounded-lg bg-skeleton" />
            <div className="space-y-2">
              <div className="h-3 w-full rounded-full bg-skeleton" />
              {!compact && (
                <div className="h-3 w-5/6 rounded-full bg-skeleton" />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
