import React from "react";
import type { Metadata } from "next";
import BlogSidebarClient from "@/components/blog/sidebar/BlogSidebarClient";
import BlogSidebar from "@/components/blog/sidebar/BlogSidebar";
import BlogRouteContent from "@/components/blog/BlogRouteContent";
import CoverSection from "@/components/blog/CoverSection";

export const metadata: Metadata = {
  title: "Blog",
  description: "Blog cá nhân | Lưu giữ những điều đẹp đẽ và giá trị!",
};

// Cache bài viết trong 1 ngày.
export const revalidate = 86400;

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="blog" className="pt-14 md:pb-4 pb-23">
      <div className="mx-auto w-full space-y-0 md:space-y-3">
        <CoverSection />

        <BlogRouteContent
          sidebar={
            <BlogSidebarClient>
              <BlogSidebar />
            </BlogSidebarClient>
          }
        >
          {children}
        </BlogRouteContent>
      </div>
    </main>
  );
}
