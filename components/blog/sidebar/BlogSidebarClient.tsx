"use client";

import { useRef } from "react";
import BlogSidebar from "./BlogSidebar";
import { useSmartStickySidebar } from "@/hooks/useSmartStickySidebar";

export default function BlogSidebarClient() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const { style, className } = useSmartStickySidebar({
    containerRef,
    sidebarRef,
    offsetTop: 88,
    breakpoint: 1024,
  });

  return (
    <div ref={containerRef} className="relative">
      <div ref={sidebarRef} className={className} style={style}>
        <BlogSidebar />
      </div>
    </div>
  );
}