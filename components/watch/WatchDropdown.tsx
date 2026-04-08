"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Item = {
  name: string;
  slug: string;
};

type Props = {
  label: string;
  items: Item[];
  baseHref: string;
  icon?: string;
};

export default function WatchDropdown({
  label,
  items,
  baseHref,
  icon,
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (wrapRef.current && !wrapRef.current.contains(target)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={wrapRef}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="
          group relative flex items-center gap-2 rounded-full px-4 py-2.5
          text-sm font-medium text-white/70 hover:text-white hover:bg-white/[0.06]
          active:scale-95 transition-all duration-300 cursor-pointer
        "
        aria-expanded={open}
      >
        {icon && (
          <i className={`${icon} relative z-10 text-[15px] transition-transform duration-300 group-hover:scale-105`} />
        )}

        <span className="relative z-10">{label}</span>

        <i
          className={`fa-duotone fa-chevron-down relative z-10 text-[11px] transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+14px)] z-[90] w-[290px] rounded-3xl border border-white/10 bg-[#0a1427]/95 p-3 shadow-[0_24px_80px_rgba(0,0,0,0.38)] backdrop-blur-2xl"
          >
            <div className="px-2 pb-2 pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
                Explore
              </p>
            </div>

            <div className="grid max-h-[360px] grid-cols-1 gap-1.5 overflow-y-auto pr-1">
              {items.map((item) => (
                <Link
                  key={item.slug}
                  href={`${baseHref}/${item.slug}`}
                  onClick={() => setOpen(false)}
                  className="
                    flex items-center justify-between rounded-2xl px-4 py-3
                    text-white/78 hover:bg-white/[0.06] hover:text-white
                    active:scale-[0.98] transition-all
                  "
                >
                  <span className="text-sm font-medium">{item.name}</span>
                  <i className="fa-duotone fa-arrow-up-right text-xs text-white/30" />
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}