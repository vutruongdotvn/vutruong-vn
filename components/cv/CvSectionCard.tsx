import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export default function CvSectionCard({
  icon,
  eyebrow,
  title,
  sectionNumber,
  count,
  children,
  className,
}: {
  icon: string;
  eyebrow: string;
  title: string;
  sectionNumber: string;
  count?: number;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "cv-section-card overflow-hidden sm:rounded-2xl sm:border border-border bg-card shadow-[0_18px_60px_rgba(15,23,42,0.06)]",
        className,
      )}
    >
      <header className="relative isolate flex items-center gap-3 sm:gap-4 overflow-hidden bg-[#111216] p-3 px-4 sm:py-4 text-white">
        <div
          className="pointer-events-none absolute -right-20 -top-24 -z-10 size-64 rounded-full border border-white/[0.06]"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -bottom-7 right-4 -z-10 select-none text-8xl font-black tracking-[-0.08em] text-white/[0.025]"
          aria-hidden="true"
        >
          {sectionNumber}
        </span>

        <span className="grid size-8 sm:size-10 xl:size-12 shrink-0 place-items-center rounded-full sm:rounded-2xl border border-white/10 bg-white/[0.08] text-sm sm:text-lg xl:text-lg text-white shadow-inner shadow-white/5">
          <i className={cn("fa-duotone", icon)} aria-hidden="true" />
        </span>

        <div className="min-w-0 flex-1">
          {/* <p className="text-[0.62rem] font-extrabold uppercase tracking-[0.24em] text-white/40">
            {sectionNumber} / {eyebrow}
          </p> */}
          <h2 className="text-base sm:text-lg xl:text-xl font-medium sm:font-bold text-white uppercase tracking-[0.05em]">
            {title}
          </h2>
        </div>

        {typeof count === "number" && (
          <div className="relative z-10 hidden shrink-0 text-right sm:block">
            <span className="block text-xl font-black tracking-[-0.04em] text-muted-foreground">
              {count.toString().padStart(2, "0")}
            </span>
            {/* <span className="mt-0.5 block text-[0.52rem] font-extrabold uppercase tracking-[0.2em] text-white/35">
              Mục
            </span> */}
          </div>
        )}
      </header>

      <div className="p-3 sm:p-4">{children}</div>
    </section>
  );
}
