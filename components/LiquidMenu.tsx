"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const menuItems = [
  {
    label: "Home",
    href: "/",
    icon: "fa-house",
  },
  {
    label: "About",
    href: "/blog/about",
    icon: "fa-user-vneck",
  },
  {
    label: "Blog",
    href: "/blog",
    icon: "fa-pen",
  },
  {
    label: "Secret",
    href: "/secret",
    icon: "fa-shield-keyhole",
  },
];

export default function LiquidMenu() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  };

  const activeIndex = menuItems.findIndex((item) =>
    isActive(item.href)
  );

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
      <div className="pointer-events-auto relative flex h-[56px] w-full max-w-xl items-center justify-around border border-white/25
      rounded-full bg-white/50 hover:bg-white/75 transition duration-300 px-1 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.05)]">

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
              className="block h-full w-1/5 rounded-full bg-black/[0.1]"
            />
          </div>
        )}

        {menuItems.map((item) => {
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
                  ? "font-bold text-black"
                  : "text-black/50"
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
          className="relative z-10 flex h-[54px] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-[27px] text-black/50 cursor-pointer"
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