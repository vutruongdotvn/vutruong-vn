import React from "react";
import type { Metadata } from "next";
import BlogSidebar from "@/components/blog/sidebar/BlogSidebar";

export const metadata: Metadata = {
  title: "Blog",
  description: "Blog cá nhân | Lưu giữ những điều đẹp đẽ và giá trị!",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main id="blog" className="py-26">
      <div className="max-w-6xl w-full mx-auto px-0 sm:px-4 space-y-1 md:space-y-4">

        {/* GRID LAYOUT */}
        <div className="mainBlog grid grid-cols-1 lg:grid-cols-10 gap-3 md:gap-4">

          {/* SIDEBAR */}
          <div className="sidebar-widget lg:col-span-4 order-1 mb-1 sm:mb-4">
            <BlogSidebar />
          </div>

          {/* MAIN FEED */}
          <section className="postFeeds space-y-1 md:space-y-4 lg:col-span-6 order-2">
            {children}
          </section>

        </div>
      </div>
    </main>
  );
}