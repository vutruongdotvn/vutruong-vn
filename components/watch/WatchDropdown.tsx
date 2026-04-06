"use client";

import Link from "next/link";
import { useState } from "react";

type Item = {
  name: string;
  slug: string;
};

type Props = {
  label: string;
  items: Item[];
  baseHref: string;
};

export default function WatchDropdown({ label, items, baseHref }: Props) {
  const [open, setOpen] = useState(false);

  if (!items?.length) return null;

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button className="flex items-center gap-2 text-[15px] font-semibold text-white/90 transition hover:text-white">
        <span>{label}</span>
        <span className="text-white/45">▾</span>
      </button>

      <div
        className={`absolute left-0 top-full z-50 pt-3 transition-all duration-200 ${
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none translate-y-1 opacity-0"
        }`}
      >
        <div className="w-[280px] rounded-2xl border border-white/10 bg-[#0b1224]/95 p-3 shadow-[0_20px_50px_rgba(0,0,0,.45)] backdrop-blur-xl">
          <div className="grid max-h-[420px] grid-cols-1 gap-1 overflow-y-auto pr-1">
            {items.map((item) => (
              <Link
                key={item.slug}
                href={`${baseHref}/${item.slug}`}
                className="rounded-xl px-3 py-2.5 text-[14px] font-medium text-slate-300 transition hover:bg-white/6 hover:text-white"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}