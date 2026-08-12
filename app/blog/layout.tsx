import React from "react";
import type { Metadata } from "next";
import BlogSidebarClient from "@/components/blog/sidebar/BlogSidebarClient";
import BlogSidebar from "@/components/blog/sidebar/BlogSidebar";
import CoverSection from "@/components/blog/CoverSection";

export const metadata: Metadata = {
  title: "Blog",
  description: "Blog cá nhân | Lưu giữ những điều đẹp đẽ và giá trị!",
};

// Cache bài viết trong 1 giờ, hoặc thậm chí 1 ngày (86400)
export const revalidate = 86400;

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="blog" className="pt-12 sm:pt-18 pb-5">
      <div className="max-w-6xl w-full mx-auto px-0 sm:px-4 space-y-1 md:space-y-4">
        
        {/* CoverSection giờ đây là Server Component tải siêu tốc */}
        <CoverSection />

        <div className="mainBlog grid grid-cols-1 lg:grid-cols-10 gap-1 sm:gap-4">
          
          {/* SIDEBAR: Truyền Component con vào qua children */}
          <div className="sidebar-widget lg:col-span-4 order-1 relative">
            <BlogSidebarClient>
               <BlogSidebar />
            </BlogSidebarClient>
          </div>

          {/* MAIN FEED */}
          <section className="postFeeds space-y-1 sm:space-y-4 lg:col-span-6 order-2">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}