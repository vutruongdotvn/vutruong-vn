"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import CreatePostBox from "@/components/blog/CreatePostBox";
import { useUser } from "@/hooks/useUser";

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
  const { user, loading: userLoading } = useUser();
  const pathname = usePathname().replace(/\/+$/, "") || "/";
  const adminUser =
    user?.email?.trim().toLowerCase() === "admin@vutruong.vn" ? user : null;
  const isBlogFeedRoute = pathname === "/blog";
  const isFullWidthRoute = FULL_WIDTH_ROUTES.some((route) =>
    matchesRoute(pathname, route),
  );

  return (
    <div
      className={
        isFullWidthRoute
          ? "mx-auto w-full max-w-6xl"
          : "mainBlog mx-auto grid w-full max-w-6xl grid-cols-1 gap-0 lg:grid-cols-10 lg:gap-3"
      }
    >
      <section
        className={
          isFullWidthRoute
            ? "blogFullWidthContent mx-auto w-full max-w-6xl"
            : "postFeeds order-2 self-start overflow-hidden rounded-0 sm:rounded-2xl lg:order-1 lg:col-span-6 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)]"
        }
      >
        {/*
          CreatePostBox luôn được mount ở layout /blog và chỉ đổi trạng thái
          hiển thị, nên profile/modal không bị khởi tạo lại khi đổi route con.
        */}
        {adminUser && (
          <CreatePostBox
            user={adminUser}
            authLoading={userLoading}
            visible={isBlogFeedRoute}
          />
        )}
        {children}
      </section>

      {/*
        Luôn giữ sidebar trong cây React để bảo toàn state và dữ liệu widget
        khi chuyển route nội bộ; chỉ ẩn khỏi layout ở các trang full-width.
      */}
      <div
        className={
          isFullWidthRoute
            ? "hidden"
            : "sidebar-widget relative order-1 lg:order-2 lg:col-span-4"
        }
        aria-hidden={isFullWidthRoute || undefined}
      >
        {sidebar}
      </div>
    </div>
  );
}