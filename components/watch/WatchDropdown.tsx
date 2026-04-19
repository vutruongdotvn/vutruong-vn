"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type Item = {
  name: string;
  slug: string;
};

type Props = {
  label: string;
  items: Item[];
  baseHref: string;
  icon?: string;
  align?: "left" | "right";
};

export default function WatchDropdown({
  label,
  items,
  baseHref,
  icon,
  align = "left",
}: Props) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const normalizedItems = useMemo(
    () => items.filter((item) => item?.name && item?.slug),
    [items]
  );

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
        {open && (
          <motion.span
            layoutId={`watch-dropdown-pill-${label}`}
            className="absolute inset-0 rounded-full bg-white/[0.06]"
            transition={{
              type: "spring",
              stiffness: 380,
              damping: 30,
            }}
          />
        )}

        {icon && (
          <i
            className={`${icon} relative z-10 text-[15px] transition-transform duration-300 ${
              open ? "scale-105 text-white" : "group-hover:scale-105"
            }`}
          />
        )}

        <span className="relative z-10 whitespace-nowrap">{label}</span>

        <i
          className={`fa-duotone fa-chevron-down relative z-10 text-[11px] transition-transform duration-300 ${
            open ? "rotate-180 text-white" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.965 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.24, ease: "easeOut" }}
            className={`
              absolute top-[calc(100%+14px)] z-[90]
              w-[680px] max-w-[min(680px,calc(100vw-40px))]
              overflow-hidden rounded-[2rem]
              border border-white/10
              bg-black
              shadow-[0_30px_100px_rgba(0,0,0,0.45)]
              ${align === "right" ? "right-0" : "left-0"}
            `}
          >
            {/* BACKGROUND GLOW */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.04),transparent_30%)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
            </div>

            {/* HEADER */}
            <div className="relative border-b border-white/8 px-4 pb-3 pt-4">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    {icon && (
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.06] text-white/80 shadow-inner">
                        <i className={`${icon} text-[14px]`} />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-white">
                        {label}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 rounded-full border border-white/10 bg-white/[0.05] px-3 py-1.5 text-[11px] font-semibold text-white/50">
                  {normalizedItems.length}
                </div>
              </div>
            </div>

            {/* GRID */}
            <div
              className="
                relative max-h-[800px] overflow-y-auto p-3
                [scrollbar-width:none] [&::-webkit-scrollbar]:hidden
              "
            >
              <div className="grid grid-cols-4 gap-2.5">
                {normalizedItems.map((item, index) => (
                  <motion.div
                    key={item.slug}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.5,
                      delay: Math.min(index * 0.01, 0.12),
                    }}
                  >
                    <Link
                      href={`${baseHref}/${item.slug}`}
                      prefetch={false}
                      onClick={() => setOpen(false)}
                      className="truncate
                        group relative flex min-h-[auto] items-center justify-between gap-3
                        overflow-hidden rounded-[1.35rem]
                        border border-white/8 bg-white/[0.04]
                        px-4 py-3.5 text-white/80
                        transition-all duration-300
                        hover:-translate-y-[1.5px]
                        hover:border-white/14 hover:bg-white/[0.08] hover:text-white
                        hover:shadow-[0_12px_30px_rgba(0,0,0,0.18)]
                        active:scale-[0.985]
                      "
                    >
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.08),transparent_38%)]" />
                      </div>

                      <div className="relative z-10 min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold leading-5 text-center">
                          {item.name}
                        </p>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}