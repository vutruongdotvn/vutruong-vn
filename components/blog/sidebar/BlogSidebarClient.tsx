"use client";

import { useRef } from "react";
import { useSmartStickySidebar } from "@/hooks/useSmartStickySidebar";

// Nhận children từ Layout truyền vào
export default function BlogSidebarClient({ children }: { children: React.ReactNode }) {
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
        {/* Component bên trong vẫn là Server Component */}
        {children}
      </div>
    </div>
  );
}