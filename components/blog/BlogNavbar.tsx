"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  { label: "Bài viết", icon: "fa-feed", href: "/blog" },
  { label: "Giới thiệu", icon: "fa-user", href: "/blog/about" },
  { label: "Ảnh", icon: "fa-image", href: "/blog/photos" },
  { label: "Video", icon: "fa-video", href: "/blog/videos" },
  { label: "Watch", icon: "fa-clapperboard-play", href: "/watch" },
];

const childRoutes = tabs
  .filter((tab) => tab.href !== "/blog")
  .map((tab) => tab.href);

function matchesRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function isTabActive(pathname: string, href: string) {
  if (href !== "/blog") {
    return matchesRoute(pathname, href);
  }

  if (pathname === "/blog") return true;
  if (!pathname.startsWith("/blog/")) return false;

  // Trang chi tiết bài viết và trang tag vẫn thuộc tab "Bài viết".
  return !childRoutes.some((childRoute) =>
    matchesRoute(pathname, childRoute),
  );
}

export default function BlogNavbar() {
  const pathname = usePathname().replace(/\/+$/, "") || "/";

  return (
    <div className="absolute bottom-0 left-0 w-full border-t border-t-slate-200">
      <div className="scrollbar-none flex gap-1 overflow-x-auto overscroll-x-contain whitespace-nowrap text-sm font-medium [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map((tab) => {
          const isActive = isTabActive(pathname, tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={`flex shrink-0 items-center gap-2 border-b-3 px-3 py-4 hover:border-primary active:scale-98 ${
                isActive ? "border-primary" : "border-transparent"
              }`}
            >
              <i className={`fad ${tab.icon}`} />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}