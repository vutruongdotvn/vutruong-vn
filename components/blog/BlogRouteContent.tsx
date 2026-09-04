"use client";

import type { ReactNode } from "react";
import { useSelectedLayoutSegment } from "next/navigation";
import CreatePostBox from "@/components/blog/CreatePostBox";
import { useUser } from "@/hooks/useUser";

type BlogRouteContentProps = {
  children: ReactNode;
  sidebar: ReactNode;
};

const FULL_WIDTH_SEGMENTS = new Set(["about", "photos", "videos"]);

export default function BlogRouteContent({
  children,
  sidebar,
}: BlogRouteContentProps) {
  const { user, role, loading: userLoading } = useUser();
  const selectedChildSegment = useSelectedLayoutSegment();
  const adminUser = user && role === "admin" ? user : null;

  // Khi mở Intercepting Route, URL đổi thành /blog/post/[id] nhưng slot
  // children vẫn giữ page /blog làm nền. Dựa vào segment của children giúp
  // CreatePostBox tiếp tục hiển thị trong modal route, đồng thời vẫn ẩn ở
  // trang chi tiết canonical khi người dùng tải trực tiếp URL bài viết.
  const isBlogFeedRoute = selectedChildSegment === null;
  const isCanonicalPostRoute = selectedChildSegment === "post";

  // Layout cũng phải bám theo slot children đang hiển thị, không theo URL tổng.
  // Ví dụ: mở modal từ /blog/photos làm URL thành /blog/post/[id], nhưng
  // children vẫn là "photos" nên trang nền phải tiếp tục giữ full-width.
  const isFullWidthRoute =
    selectedChildSegment !== null &&
    FULL_WIDTH_SEGMENTS.has(selectedChildSegment);

  return (
    <div
      // URL của Intercepted Modal cũng là /blog/post/..., nên pathname không
      // đủ để phân biệt hai luồng. Thuộc tính này phản ánh đúng slot children:
      // chỉ canonical detail là "detail", Feed/Tag nền modal là "background".
      data-blog-route-context={
        isCanonicalPostRoute ? "detail" : "background"
      }
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
            : "postFeeds order-2 self-start overflow-hidden rounded-0 sm:rounded-2xl lg:order-1 lg:col-span-6 bg-card shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-border"
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
