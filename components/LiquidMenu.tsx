"use client";

import type { MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const menuItems = [
  {
    label: "Home",
    href: "/",
    icon: "fad fa-house",
  },
  {
    label: "About",
    href: "/about",
    icon: "fad fa-user",
  },
  {
    label: "Contact",
    href: "/contact",
    icon: "fad fa-envelope",
  },
  {
    label: "Blog",
    href: "/blog",
    icon: "fad fa-pen-circle",
  },
];

export default function LiquidMenu() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  };

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
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[24] flex justify-center px-5 pb-[calc(20px+env(safe-area-inset-bottom))] md:hidden"
    >
      <div className="pointer-events-auto relative flex h-[50px] w-full max-w-[430px] items-center justify-around border border-white/25 rounded-[34px] bg-white/[0.5] px-1 backdrop-blur-xl">
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
              className={`relative flex h-[42px] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-[27px]
                ${active ? "text-black/80 font-bold" : "text-black/35"
                }`}
            >
              {active && (
                <motion.span
                  layoutId="liquid-menu-active"
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 35,
                    mass: 0.7,
                  }}
                  className="absolute inset-0 rounded-[27px] bg-black/[0.1]"
                />
              )}

              <i
                className={`${item.icon} relative z-10 text-[20px]`}
                aria-hidden="true"
              />

              <span className="relative z-10 text-[11px] leading-none hidden">
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          aria-label="Mở menu"
          onClick={toggleNavbarMobileMenu}
          className="relative flex h-[54px] min-w-0 flex-1 flex-col items-center justify-center gap-1.5 rounded-[27px] text-black/50"
        >
          <i
            className="fad fa-bars relative z-10 text-[20px]"
            aria-hidden="true"
          />

          <span className="relative z-10 text-[11px] leading-none hidden">
            Menu
          </span>
        </button>
      </div>
    </nav>
  );
}