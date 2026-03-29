"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // MENU CONFIG
  const menu = [
    { name: "Bio", href: "/bio", icon: "fa-duotone fa-users" },
    { name: "Dự án", href: "/project", icon: "fa-duotone fa-code" },
    { name: "Liên hệ", href: "/contact", icon: "fa-duotone fa-envelope" },
    { name: "Blog", href: "/blog", icon: "fa-duotone fa-comment-pen" },
  ];

  // ACTIVE LOGIC
  const isActive = (href: string) => {
    return href === "/" ? pathname === "/" : pathname.startsWith(href);
  };

  // AUTO TITLE
  const current = menu.find((item) => pathname.startsWith(item.href));
  const title = pathname === "/" ? "VT Zone" : current?.name || "VT Zone";

  // CLICK OUTSIDE
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
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

  // SCROLL STATE
  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 18);
    };

    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 pt-4 select-none">
      <div className="w-full max-w-2xl">
        {/* NAVBAR */}
        <div
          className={`
            relative flex items-center justify-between
            rounded-2xl border border-white/60
            bg-white/60 backdrop-blur-xl
            shadow-[0_8px_30px_rgba(0,0,0,0.05)]
            transition-all duration-700 ease-out
            ${scrolled ? "px-3 py-2.5" : "px-3 py-3"}
          `}
        >
          {/* LIGHT GLOW */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-r from-white/40 via-transparent to-white/30" />

          {/* LOGO + TITLE */}
          <Link
            href="/"
            className="relative z-10 flex items-center gap-2.5 pl-1"
          >
            <Image
              src="/logo.png"
              alt="logo"
              width={40}
              height={40}
              className={`
                pointer-events-none transition-all duration-300
                ${scrolled ? "w-9 h-9" : "w-10 h-10"}
              `}
              priority
            />

            <span
              className={`
                font-bold tracking-wide text-gray-900 transition-all duration-300
                ${scrolled ? "text-lg" : "text-xl"}
              `}
            >
              {title}
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <nav className="relative z-10 hidden md:flex items-center gap-1">
            {menu.map((item) => {
              const active = isActive(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  prefetch
                  className={`
                    group relative flex items-center gap-2
                    rounded-full px-4 py-2.5
                    text-sm font-medium transition-all duration-300
                    ${
                      active
                        ? "bg-gray-900 text-white shadow-sm"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100/80"
                    }
                  `}
                >
                  <i
                    className={`${item.icon} text-[14px] transition-transform duration-300 ${
                      active ? "" : "group-hover:scale-105"
                    }`}
                  />

                  <span>{item.name}</span>

                  {/* Active Dot */}
                  {active && (
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-white/90" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="
              relative z-10 md:hidden
              w-11 h-11 flex items-center justify-center
              rounded-full border border-gray-100
              bg-white/70 hover:bg-white
              shadow-sm transition-all duration-300
              text-gray-700 hover:text-black
              cursor-pointer
            "
            aria-label="Open menu"
          >
            <i
              className={`fa-duotone transition-all duration-300 ${
                open ? "fa-xmark text-[18px]" : "fa-bars text-[18px]"
              }`}
            />
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
            open ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

          {/* SLIDE PANEL */}
          <div
            ref={menuRef}
            className={`absolute top-0 right-0 h-full w-80 max-w-[88vw]
            bg-white/88 backdrop-blur-xl border-l border-white/70
            shadow-2xl p-5 transform transition-transform duration-300 ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
          >
            {/* MOBILE TOP */}
            <div className="flex items-center justify-between mb-6 mt-1">
              <div className="flex items-center gap-3">
                <Image
                  src="/logo.png"
                  alt="logo"
                  width={36}
                  height={36}
                  className="pointer-events-none"
                  priority
                />
                <div>
                  <Link href="/" className="font-semibold text-gray-900 leading-5">
                    {title}
                  </Link>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center text-gray-600 hover:text-black cursor-pointer"
                aria-label="Close menu"
              >
                <i className="fa-duotone fa-xmark" />
              </button>
            </div>

            {/* MOBILE MENU ITEMS */}
            <div className="flex flex-col gap-2">
              {menu.map((item) => {
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`
                      flex items-center justify-between
                      rounded-2xl px-4 py-3.5
                      text-sm font-medium transition-all duration-300
                      ${
                        active
                          ? "bg-gray-900 text-white shadow-sm"
                          : "bg-white/60 text-gray-700 hover:bg-gray-200 active:scale-95"
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <i className={`${item.icon} text-base`} />
                      <span>{item.name}</span>
                    </div>

                    {active ? (
                      <span className="w-2 h-2 rounded-full bg-white/90" />
                    ) : (
                      <i className="fa-duotone fa-arrow-right text-gray-400 text-xs" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}