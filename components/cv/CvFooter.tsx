export default function CvFooter({ updatedDate }: { updatedDate: string }) {
  return (
    <footer className="cv-footer relative isolate overflow-hidden sm:rounded-2xl sm:border border-border bg-card shadow-[0_10px_30px_rgba(15,23,42,0.04)] p-3 sm:p-4">
      <div
        className="pointer-events-none absolute -right-16 -top-20 -z-10 size-48 rounded-full border border-foreground/[0.05]"
        aria-hidden="true"
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-[#111216] text-sm text-white">
          <i className="fa-duotone fa-link" aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
            Truy cập CV tại địa chỉ
          </p>
          <p className="mt-1 text-sm font-black text-foreground tracking-[0.075em]">
            vutruong.vn/cv
          </p>
        </div>

        {updatedDate && (
          <div className="border-t border-border pt-3 sm:border-l sm:border-t-0 sm:pl-5 sm:pt-0 sm:text-right">
            <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.18em] text-muted-foreground">
              Cập nhật lần cuối
            </p>
            <p className="mt-1 text-xs font-bold text-foreground/65">
              {updatedDate}
            </p>
          </div>
        )}
      </div>
    </footer>
  );
}
