import React from "react";
import type { Metadata } from "next";
import BlogSidebarClient from "@/components/blog/sidebar/BlogSidebarClient";
import BlogSidebar from "@/components/blog/sidebar/BlogSidebar";
import CoverSection from "@/components/blog/CoverSection";
// import LiquidMenu from "@/components/blog/LiquidMenu";

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
    <main id="blog" className="pt-14 pb-23">
      <div className="w-full mx-auto space-y-0.5 md:space-y-4">
        
        {/* CoverSection giờ đây là Server Component tải siêu tốc */}
        <CoverSection />

        <div className="mainBlog grid grid-cols-1 lg:grid-cols-10 gap-0 lg:gap-4 w-full max-w-6xl mx-auto">
          
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