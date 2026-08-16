"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

type BlogRouteContentProps = {
  children: ReactNode;
  sidebar: ReactNode;
};

const FULL_WIDTH_ROUTES = ["/blog/about", "/blog/photos", "/blog/videos"];

function matchesRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function BlogRouteContent({
  children,
  sidebar,
}: BlogRouteContentProps) {
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const isFullWidthRoute = FULL_WIDTH_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );

  // Các trang nội dung độc lập dùng toàn bộ chiều rộng, không render sidebar.
  if (isFullWidthRoute) {
    return (
      <section className="blogFullWidthContent mx-auto w-full max-w-6xl">
        {children}
      </section>
    );
  }

  // Giữ nguyên layout hiện tại cho mọi route Blog còn lại.
  return (
    <div className="mainBlog mx-auto grid w-full max-w-6xl grid-cols-1 gap-0 lg:grid-cols-10 lg:gap-4">
      <div className="sidebar-widget relative order-1 lg:col-span-4">
        {sidebar}
      </div>

      <section className="postFeeds order-2 space-y-1 sm:space-y-4 lg:col-span-6">
        {children}
      </section>
    </div>
  );
}