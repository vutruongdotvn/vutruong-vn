"use client";

import { useRef } from "react";
import type { ReactNode } from "react";
import { useSmartStickySidebar } from "@/hooks/useSmartStickySidebar";

export default function CvSmartSidebar({ children }: { children: ReactNode }) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sidebarRef = useRef<HTMLDivElement | null>(null);

  const { style, className } = useSmartStickySidebar({
    containerRef,
    sidebarRef,
    offsetTop: 75,
    offsetBottom: 18,
    // Bố cục CV chỉ trở thành hai cột từ breakpoint xl.
    breakpoint: 1280,
  });

  return (
    <aside className="cv-secondary-column relative min-w-0 self-stretch">
      <div ref={containerRef} className="relative h-full min-h-full">
        <div
          ref={sidebarRef}
          className={[
            "cv-smart-sidebar space-y-3",
            "print:!static print:!inset-auto print:!w-auto print:space-y-[4mm]",
            className,
          ]
            .filter(Boolean)
            .join(" ")}
          style={style}
        >
          {children}
        </div>
      </div>
    </aside>
  );
}
