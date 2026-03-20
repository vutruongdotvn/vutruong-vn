"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
  const [open, setOpen] = useState(false);

  const menu = [
    { name: "Trang chủ", href: "/" },
    { name: "Liên hệ", href: "/contact" },
    { name: "Bio", href: "/bio" },
    { name: "Dự án", href: "/project" },
  ];

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
            {menu.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-gray-700 hover:text-black transition"
              >
                {item.name}
              </Link>
            ))}

            <Link
              href="/contact"
              className="px-4 py-2 rounded-full bg-white shadow text-sm font-medium hover:shadow-md transition"
            >
              Contact
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
        {open && (
          <div className="mt-3 rounded-2xl bg-white/90 backdrop-blur-xl border border-white/50 shadow-lg p-4 md:hidden">
            <div className="flex flex-col gap-4">
              {menu.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-gray-700"
                >
                  {item.name}
                </Link>
              ))}

              <Link
                href="/contact"
                onClick={() => setOpen(false)}
                className="mt-2 px-4 py-2 rounded-full bg-black text-white text-center"
              >
                Contact
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}