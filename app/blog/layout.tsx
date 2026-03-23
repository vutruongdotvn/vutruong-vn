import React from "react";
import Image from "next/image";
import type { Metadata } from "next";

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
    <main className="relative min-h-screen py-20">
      <div className="max-w-2xl w-screen mx-auto ">
          {/* LEFT SIDEBAR DELETED */}

          {/* MAIN FEED */}
          <section className="postFeeds">
            {children}
          </section>

        </div>
    </main>
  );
}