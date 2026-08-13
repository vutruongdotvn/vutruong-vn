"use client";

import { useLayoutEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MenuItem } from "./types";

type NavbarDesktopMenuProps = {
  mainMenu: MenuItem[];
  isActive: (href: string) => boolean;
  onNavClick: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => void;
};

type ActivePill = {
  x: number;
  width: number;
};

export default function NavbarDesktopMenu({
  mainMenu,
  isActive,
  onNavClick,
}: NavbarDesktopMenuProps) {
  const navRef = useRef<HTMLElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const [activePill, setActivePill] = useState<ActivePill | null>(null);

  const activeIndex = mainMenu.findIndex((item) =>
    isActive(item.href)
  );

  useLayoutEffect(() => {
    const updateActivePill = () => {
      if (activeIndex < 0) {
        setActivePill(null);
        return;
      }

      const item = itemRefs.current[activeIndex];

      if (!item) return;

      setActivePill({
        x: item.offsetLeft,
        width: item.offsetWidth,
      });
    };

    updateActivePill();

    window.addEventListener("resize", updateActivePill);

    return () => {
      window.removeEventListener("resize", updateActivePill);
    };
  }, [activeIndex, mainMenu]);

  return (
    <nav
      ref={navRef}
      className="relative flex items-center gap-1.5"
    >
      {/* ACTIVE PILL - CHỈ CHUYỂN ĐỘNG NGANG */}
      {activePill && (
        <motion.span
          initial={false}
          animate={{
            x: activePill.x,
            width: activePill.width,
          }}
          transition={{
            type: "spring",
            stiffness: 380,
            damping: 30,
          }}
          className="pointer-events-none absolute left-0 top-0 h-full rounded-full bg-black shadow-lg"
        />
      )}

      {mainMenu.map((item, index) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.name}
            ref={(element) => {
              itemRefs.current[index] = element;
            }}
            href={item.href}
            prefetch
            onClick={(e) => onNavClick(e, item.href)}
            className={`
              relative z-10 group flex items-center gap-2 rounded-full px-4 py-2.5
              text-sm font-medium active:scale-95 transition-colors duration-300
              ${
                active
                  ? "text-white"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"
              }
            `}
          >
            <i
              className={`${item.icon} relative z-10 text-base transition-transform duration-300 ${
                active ? "" : "group-hover:scale-105"
              }`}
            />

            <span className="relative z-10">
              {item.name}
            </span>

            {active && (
              <span className="relative z-10 inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-white/90" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}