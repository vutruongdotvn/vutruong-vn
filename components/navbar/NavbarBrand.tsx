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
      className="relative z-10 flex items-center gap-2 pl-1 min-w-0"
    >
      <span className="relative size-10 shrink-0" aria-hidden="true">
        <Image
          src="/logo.png"
          alt=""
          fill
          sizes="40px"
          className="pointer-events-none object-contain dark:hidden"
          priority
          unoptimized
        />

        <Image
          src="/logo-white.png"
          alt=""
          fill
          sizes="40px"
          className="pointer-events-none hidden object-contain dark:block"
          priority
          unoptimized
        />
      </span>

      <div className="min-w-0">
        <div
          className={`
            font-bold text-foreground transition-all duration-300 truncate text-lg
          `}
        >
          {title}
        </div>

        {/*
        <div
          className={` metaTitlePage_removeHiddenClasstoShow
            text-xs text-muted-foreground transition-all duration-300 truncate
            ${scrolled ? "opacity-80" : "opacity-100"}
          `}
        >
          {subtitle}
        </div>
        */}
        
      </div>
    </Link>
  );
}
