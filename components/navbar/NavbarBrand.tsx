"use client";

import Link from "next/link";
import Image from "next/image";

type NavbarBrandProps = {
  currentPageHref: string;
  title: string;
  subtitle: string;
  scrolled: boolean;
  onNavClick: (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => void;
};

export default function NavbarBrand({
  currentPageHref,
  title,
  subtitle,
  scrolled,
  onNavClick,
}: NavbarBrandProps) {
  return (
    <Link
      href={currentPageHref}
      onClick={(e) => onNavClick(e, currentPageHref)}
      className="relative z-10 flex items-center gap-3 pl-1 min-w-0"
    >
      <Image
        src="/logo.png"
        alt="logo"
        width={40}
        height={40}
        className={`
          pointer-events-none shrink-0 transition-all duration-300
          ${scrolled ? "size-10" : "size-11"}
        `}
        priority
      />

      <div className="min-w-0 leading-tight">
        <div
          className={`
            font-bold tracking-wide text-gray-800 transition-all duration-300 truncate
            ${scrolled ? "text-lg" : "text-lg"}
          `}
        >
          {title}
        </div>
        <div
          className={` metaTitlePage_removeHiddenClasstoShow
            hidden text-[11px] text-gray-500 transition-all duration-300 truncate
            ${scrolled ? "opacity-80" : "opacity-100"}
          `}
        >
          {subtitle}
        </div>
      </div>
    </Link>
  );
}