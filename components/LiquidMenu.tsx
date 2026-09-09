"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { useUser } from "@/hooks/useUser";

const menuItems = [
  {
    label: "Home",
    href: "/",
    icon: "fa-house",
  },
  {
    label: "Blog",
    href: "/blog",
    icon: "fa-signature",
  },
  {
    label: "Watch",
    href: "/watch",
    icon: "fa-film",
  },
  {
    label: "CV",
    href: "/cv",
    icon: "fa-briefcase",
  },
];

export default function LiquidMenu() {
  const pathname = usePathname();
  const { role } = useUser();
  const visibleMenuItems =
    role === "admin"
      ? menuItems
      : menuItems.filter((item) => item.href !== "/cv");

  const isActive = (href: string) => {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  };

  const activeIndex = visibleMenuItems.findIndex((item) =>
    isActive(item.href)
  );
  const itemWidth = `${100 / (visibleMenuItems.length + 1)}%`;

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (pathname !== href) return;

    event.preventDefault();

    window.dispatchEvent(
      new CustomEvent("navbar-handle-nav-click", {
        detail: { href },
      })
    );
  };

  const toggleNavbarMobileMenu = () => {
    window.dispatchEvent(new Event("navbar-mobile-toggle"));
  };

  return (
    <nav
      aria-label="Điều hướng mobile"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[24] flex justify-center px-6 pb-[calc(20px+env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="pointer-events-auto relative flex h-[56px] w-full max-w-xl items-center justify-around border border-border
      rounded-full bg-card/70 hover:bg-card/90 transition duration-300 px-1 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.05)]">

        {/* ACTIVE PILL - CHỈ CHUYỂN ĐỘNG THEO TRỤC X */}
        {activeIndex >= 0 && (
          <div className="pointer-events-none absolute inset-x-1 top-[6.5px] h-[42px]">
            <motion.span
              initial={false}
              animate={{
                x: `${activeIndex * 100}%`,
              }}
              transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20,
                    mass: 0.5,
              }}
              style={{ width: itemWidth }}
              className="block h-full rounded-full bg-foreground/10"
            />
          </div>
        )}

        {visibleMenuItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onClick={(event) =>
                handleNavClick(event, item.href)
              }
              className={`relative z-10 flex h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0
                ${active
                  ? "font-bold text-foreground"
                  : "text-foreground/50"
                }`}
            >
              <i
                className={`${active ? "fad" : "fal"} ${item.icon} relative z-10 text-lg`}
                aria-hidden="true"
              />

              <span className="relative z-10 hidden text-[11px] leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          aria-label="Mở menu"
          onClick={toggleNavbarMobileMenu}
          className="relative z-10 flex h-[54px] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-[27px] text-foreground/50 cursor-pointer"
        >
          <i
            className="fal fa-bars relative z-10 text-lg"
            aria-hidden="true"
          />

          <span className="relative z-10 hidden text-[11px] leading-none">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}
