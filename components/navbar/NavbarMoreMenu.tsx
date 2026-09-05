"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { MenuItem } from "./types";
import ThemeSwitcher from "@/components/theme/ThemeSwitcher";

type NavbarMoreMenuProps = {
  moreRef: React.RefObject<HTMLDivElement | null>;
  moreOpen: boolean;
  setMoreOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setUserOpen: React.Dispatch<React.SetStateAction<boolean>>;
  moreMenu: MenuItem[];
  isActive: (href: string) => boolean;
  onNavClick: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => void;
  onScrollTop: () => void;
  onRefreshCurrent: () => void;
};

export default function NavbarMoreMenu({
  moreRef,
  moreOpen,
  setMoreOpen,
  setUserOpen,
  moreMenu,
  isActive,
  onNavClick,
  onScrollTop,
  onRefreshCurrent,
}: NavbarMoreMenuProps) {
  return (
    <div className="relative" ref={moreRef}>
      <button
        onClick={() => {
          setMoreOpen((prev) => !prev);
          setUserOpen(false);
        }}
        className={`
          cursor-pointer
          group relative flex items-center gap-2 rounded-full px-4 py-2.5
          text-sm font-medium active:scale-95 transition-all duration-300
          ${moreMenu.some((item) => isActive(item.href))
            ? "bg-nav-active text-nav-active-foreground shadow-lg"
            : "text-foreground/75 hover:text-foreground hover:bg-secondary"
          }
        `}
        aria-label="Open more menu"
        aria-expanded={moreOpen}
      >
        <i className="fa-duotone fa-grid-2 relative z-10 text-base transition-transform duration-300 group-hover:scale-105" />
        <span className="relative z-10">More</span>
        <i
          className={`fa-duotone fa-chevron-down relative z-10 text-xs transition-transform duration-300 ${moreOpen ? "rotate-180" : ""
            }`}
        />
      </button>

      <AnimatePresence>
        {moreOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 1 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="absolute right-0 top-[calc(100%+9px)] w-72 rounded-xl bg-card shadow-[0_10px_40px_rgba(0,0,0,0.14)] p-3"
          >

            <div className="flex flex-col gap-1.5">
              {moreMenu.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={(e) => onNavClick(e, item.href)}
                    className={`
                      flex items-center justify-between rounded-2xl px-4 py-3
                      ${active
                        ? "bg-nav-active text-nav-active-foreground shadow-sm"
                        : "text-foreground/75 hover:bg-muted active:bg-secondary active:scale-97"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <i className={`${item.icon} text-base`} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>

                    {active ? (
                      <span className="w-2 h-2 rounded-full bg-nav-active-foreground/75" />
                    ) : (
                      <i className="fa-duotone fa-arrow-up-right text-xs text-muted-foreground" />
                    )}
                  </Link>
                );
              })}
            </div>

            <ThemeSwitcher />

            {/*
            <div className="mt-3 border-t border-border/70 pt-3 px-1 flex items-center gap-2">
              <button
                onClick={onScrollTop}
                className="flex-1 rounded-2xl bg-muted hover:bg-secondary text-foreground/75 text-sm font-medium px-4 py-3 transition-all cursor-pointer"
              >
                <i className="fa-duotone fa-arrow-up" />
              </button>
              <button
                onClick={onRefreshCurrent}
                className="flex-1 rounded-2xl bg-primary text-primary-foreground hover:opacity-90 text-sm font-medium px-4 py-3 transition-all cursor-pointer"
              >
                <i className="fa-duotone fa-arrows-rotate" />
              </button>
            </div>
            */}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
