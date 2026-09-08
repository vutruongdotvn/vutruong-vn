export default function CvHeader() {
  return (
    <header className="cv-cover relative isolate overflow-hidden rounded-xl border border-border bg-card p-5 shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:p-7">
      <div
        className="pointer-events-none absolute -right-28 -top-32 -z-10 size-80 rounded-full border border-foreground/[0.055]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-12 top-0 -z-10 h-full w-px rotate-[24deg] bg-foreground/[0.045]"
        aria-hidden="true"
      />

      <div className="flex items-center gap-5 sm:gap-7">
        <div className="relative grid size-20 shrink-0 place-items-center overflow-hidden rounded-[1.55rem] bg-[#111216] text-white shadow-[0_16px_35px_rgba(0,0,0,0.16)] sm:size-24">
          <span className="text-2xl font-black tracking-[-0.06em] sm:text-3xl">
            CV
          </span>
          <span className="absolute bottom-2.5 right-3 text-[0.55rem] font-extrabold tracking-[0.18em] text-white/35">
            00
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.28em] text-muted-foreground">
            Curriculum Vitae / Digital Résumé
          </p>
          <h1 className="mt-1.5 text-2xl font-black tracking-[-0.04em] text-foreground sm:text-4xl">
            Hồ sơ năng lực
          </h1>
          <div className="mt-3 flex items-center gap-3">
            <span className="h-px w-8 shrink-0 bg-foreground/25" aria-hidden="true" />
            <p className="truncate text-xs font-bold uppercase tracking-[0.12em] text-foreground/50 sm:text-sm">
              Kinh nghiệm · Kỹ năng · Dự án
            </p>
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-4 border-l border-border pl-7 lg:flex">
          <span className="grid size-12 place-items-center rounded-2xl border border-border bg-muted/30 text-lg text-foreground/65">
            <i className="fa-duotone fa-file-user" aria-hidden="true" />
          </span>
          <div className="text-right">
            <p className="text-[0.58rem] font-extrabold uppercase tracking-[0.2em] text-muted-foreground">
              Professional profile
            </p>
            <p className="mt-1 text-xs font-black uppercase tracking-[0.12em] text-foreground/75">
              00 / Introduction
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
