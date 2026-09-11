const GRID_CLASS = [
  "m-0 grid list-none grid-cols-2 gap-1.25 gap-y-6 p-0",
  "[&>li]:min-w-0",
  "min-[30rem]:grid-cols-3",
  "min-[40rem]:grid-cols-4 min-[40rem]:gap-x-2 min-[40rem]:gap-y-7",
  "min-[60rem]:grid-cols-5 min-[75rem]:grid-cols-5 min-[96rem]:grid-cols-5",
].join(" ");

export default function WatchBrowseGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div role="status" aria-label="Đang tải danh sách phim">
      <span className="sr-only">Đang tải danh sách phim…</span>
      <ul className={GRID_CLASS} aria-hidden="true" data-watch-grid-skeleton>
        {Array.from({ length: count }, (_, index) => (
          <li key={index} className="min-w-0">
            <div className="h-full min-w-0 rounded-[.8rem]">
              <div className="aspect-[2/3] rounded-[.85rem] border border-border bg-skeleton max-[39.99rem]:rounded-[.65rem]" />
              <span className="mx-auto mt-[.7rem] block h-[.75rem] w-[82%] rounded-full bg-skeleton" />
              <span className="mx-auto mt-[.3rem] block h-[.6rem] w-[62%] rounded-full bg-skeleton opacity-70" />
              <span className="mx-auto mt-[.45rem] block h-[.55rem] w-[42%] rounded-full bg-skeleton opacity-50" />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
