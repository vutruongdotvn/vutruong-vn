"use client";

import FancyboxWrapper from "@/components/blog/FancyboxWrapper";
import BlogUserPanel from "@/components/blog/BlogUserPanel";
import BlogPostFeed from "@/components/blog/BlogPostFeed";

export default function BlogPage() {
  return (
    <>
      <FancyboxWrapper />
      <BlogUserPanel />
      <BlogPostFeed />
    </>
  );
}