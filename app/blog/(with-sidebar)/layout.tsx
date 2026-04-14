import React from "react";
import type { Metadata } from "next";
import BlogSidebar from "@/components/blog/sidebar/BlogSidebar";

export const metadata: Metadata = {
  title: "Blog",
  description: "Blog cá nhân | Lưu giữ những điều đẹp đẽ và giá trị!",
};

export default function BlogWithSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid__lg:grid-cols-10 gap-3 md:gap-4">

      {/* SIDEBAR */}
      <div className="lg:col-span-4 order-1 mb-1 sm:mb-4">
        <BlogSidebar />
      </div>

      {/* MAIN FEED */}
      <section id="mainBlog" className="space-y-1 sm:space-y-4 lg:col-span-6 order-2">
        {children}
      </section>

    </div>
  );
}