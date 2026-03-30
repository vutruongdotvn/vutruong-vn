import React from "react";
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
    <main className="centerMain py-28">
      <div className="max-w-2xl w-screen mx-auto px-5 sm:px-0">

          {/* MAIN FEED */}
          <section className="postFeeds space-y-8">
            {children}
          </section>

        </div>
    </main>
  );
}