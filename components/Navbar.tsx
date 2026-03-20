"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useRef, useEffect } from "react";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const menu = [
  // { name: "Trang chủ", href: "/", icon: "fa-duotone fa-home" },
  { name: "Bio", href: "/bio", icon: "fa-duotone fa-user" },
  { name: "Dự án", href: "/project", icon: "fa-duotone fa-diagram-project" },
  { name: "Blog", href: "/blog", icon: "fa-duotone fa-newspaper" },
];
useEffect(() => {
  function handleClickOutside(e: MouseEvent) {
    if (
      menuRef.current &&
      !menuRef.current.contains(e.target as Node)
    ) {
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
    <header className="fixed top-0 left-0 w-full z-50 flex justify-center px-4 pt-4">
      <div className="w-full max-w-3xl">
        <div className="flex items-center justify-between p-2 rounded-full 
          bg-white/70 backdrop-blur-xl border border-white/50 
          shadow-[0_8px_30px_rgba(0,0,0,0.08)]">

          {/* Logo + Name */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/avatar.JPEG"
              alt="avatar"
              width={36}
              height={36}
              className="rounded-full pointer-events-none"
            />
            <span className="font-medium text-gray-900">
              Vũ Trường
            </span>
          </Link>

          {/* Desktop Menu */}
          <nav className="hidden md:flex items-center gap-6">
            {menu.map((item) => {
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href);

  return (
    <Link
      key={item.name}
      href={item.href}
      className={`flex items-center gap-2 text-sm transition ${
        isActive
          ? "font-bold text-black"
          : "text-gray-700 hover:text-black"
      }`}
    >
      {/* ICON */}
      <i className={`${item.icon} text-[14px]`}></i>

      {/* TEXT */}
      {item.name}
    </Link>
  );
})}


<Link
  href="/contact"
  className={`px-4 py-2 rounded-full text-sm font-medium transition ${
    pathname === "/contact"
      ? "bg-black text-white"
      : "bg-white shadow hover:shadow-md"
  }`}
>
  Liên hệ
</Link>
          </nav>

          {/* Mobile Button */}
          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-xl me-2"
          >
            <i className="fa-solid fa-bars"></i>
          </button>
        </div>

        {/* Mobile Menu */}
        <div
  className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
    open ? "visible opacity-100" : "invisible opacity-0"
  }`}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/30"></div>

  {/* Slide panel */}
  <div ref={menuRef} 
    className={`absolute top-0 right-0 h-full w-72 bg-white shadow-xl p-6
    transform transition-transform duration-300 ${
      open ? "translate-x-0" : "translate-x-full"
    }`}
  >
    <div className="flex flex-col gap-5 mt-10">
      {menu.map((item) => {
  const isActive =
    item.href === "/"
      ? pathname === "/"
      : pathname.startsWith(item.href);

  return (
    <Link
      key={item.name}
      href={item.href}
      onClick={() => setOpen(false)}
      className={`flex items-center gap-3 ${
        isActive ? "font-bold text-black" : "text-gray-700"
      }`}
    >
      <i className={item.icon}></i>
      {item.name}
    </Link>
  );
})}

      <Link
        href="/contact"
        onClick={() => setOpen(false)}
        className="mt-4 px-4 py-2 rounded-full bg-black text-white text-center"
      >
        Liên hệ
      </Link>
    </div>
  </div>
</div>
      </div>
    </header>
  );
}