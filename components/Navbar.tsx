"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);

  // ✅ MENU CONFIG (chỉ cần sửa ở đây)
  const menu = [
    { name: "Bio", href: "/bio", icon: "fa-duotone fa-users" },
    { name: "Dự án", href: "/project", icon: "fa-duotone fa-code" },
    { name: "Blog", href: "/blog", icon: "fa-duotone fa-comment-pen" },
    { name: "Liên hệ", href: "/contact", icon: "fa-duotone fa-envelope" },
  ];

  // ✅ ACTIVE LOGIC
  const isActive = (href: string) => {
    return href === "/"
      ? pathname === "/"
      : pathname.startsWith(href);
  };

  // ✅ AUTO TITLE (sync theo menu)
  const current = menu.find((item) => pathname.startsWith(item.href));
  const title = pathname === "/" ? "VT Zone" : current?.name || "vutruong.vn";

  // ✅ CLICK OUTSIDE → đóng menu
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

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 pt-4 select-none">
      <div className="w-full max-w-2xl">

        {/* NAVBAR */}
        <div className="flex items-center justify-between p-2 rounded-full 
          bg-white/50 backdrop-blur-xl border border-white/80 
          shadow-[0_8px_30px_rgba(0,0,0,0.08)]">

          {/* LOGO + TITLE */}
          <Link href="/" className="flex items-center gap-2 ms-1">
            <Image
              src="/logo.png"
              alt="logo"
              width={36}
              height={36}
              className="rounded-full pointer-events-none"
              priority
            />
            <span className="font-bold text-base text-gray-800 tracking-wider">
              {title}
            </span>
          </Link>

          {/* DESKTOP MENU */}
          <nav className="hidden md:flex items-center gap-1">
            {menu.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                prefetch
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition ${
                  isActive(item.href)
                    ? "bg-gray-200 text-black font-bold"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <i className={`${item.icon} text-[14px]`}></i>
                {item.name}
              </Link>
            ))}
          </nav>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-xl me-2 cursor-pointer hover:text-black"
          >
            <i className="fa-duotone fa-bars"></i>
          </button>
        </div>

        {/* MOBILE MENU */}
        <div
          className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${
            open ? "visible opacity-100" : "invisible opacity-0"
          }`}
        >
          {/* OVERLAY */}
          <div className="absolute inset-0 bg-black/10 backdrop-blur-xs"></div>

          {/* SLIDE PANEL */}
          <div
            ref={menuRef}
            className={`absolute top-0 right-0 h-full w-72 bg-white shadow-xl p-6
            transform transition-transform duration-300 ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex flex-col gap-2 mt-6">
              {menu.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-full text-sm font-medium transition ${
                    isActive(item.href)
                      ? "bg-gray-200"
                      : "hover:bg-gray-200"
                  }`}
                >
                  <i className={item.icon}></i>
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

      </div>
    </header>
  );
}