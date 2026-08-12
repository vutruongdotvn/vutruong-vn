"use client";

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

export default function NavbarDesktopMenu({
  mainMenu,
  isActive,
  onNavClick,
}: NavbarDesktopMenuProps) {
  return (
    <nav className="flex items-center gap-1.5">
      {mainMenu.map((item) => {
        const active = isActive(item.href);

        return (
          <Link
            key={item.name}
            href={item.href}
            prefetch
            onClick={(e) => onNavClick(e, item.href)}
            className={`
              relative group flex items-center gap-2 rounded-full px-4 py-2.5
              text-sm font-medium active:scale-95 transition-colors duration-300
              ${active ? "text-white" : "text-gray-600 hover:text-gray-800 hover:bg-gray-200"}
            `}
          >
            {active && (
              <motion.span
                layoutId="active-nav-pill"
                className="absolute inset-0 rounded-full bg-black shadow-lg"
                transition={{
                  type: "spring",
                  stiffness: 380,
                  damping: 30,
                }}
              />
            )}

            <i
              className={`${item.icon} relative z-10 text-base transition-transform duration-300 ${
                active ? "" : "group-hover:scale-105"
              }`}
            />
            <span className="relative z-10">{item.name}</span>

            {active && (
              <span className="relative z-10 inline-block w-1.5 h-1.5 rounded-full bg-white/90" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}