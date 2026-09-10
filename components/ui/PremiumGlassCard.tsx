"use client";

import { cn } from "@/lib/utils";

interface PremiumGlassCardProps {
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function PremiumGlassCard({
  children,
  className = "",
  contentClassName = "",
}: PremiumGlassCardProps) {
  return (
    // Thêm class "group" để các thành phần bên trong bắt được sự kiện hover từ thẻ cha
    <div className={cn("group relative w-full", className)}>

      {/* 🔮 MAIN GLASS SHELL (Lớp kính chính) */}
      <div
        className={cn(
          "relative overflow-hidden rounded-0 sm:rounded-2xl sm:border sm:border-border bg-card",
          "shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-1200 ease-out",
          "hover:shadow-[0_20px_40px_rgba(0,0,0,0.1)]",
          contentClassName
        )}
      >

        {/* Vệt sáng lướt qua (Diagonal Shine Effect) - Kích hoạt khi Hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-foreground/5 to-transparent transition-transform duration-[1800ms] ease-in-out group-hover:translate-x-full" />

        {/* 📦 CONTENT WRAPPER */}
        <div className="relative z-10 h-full w-full" id="glassCard">{children}</div>
      </div>
    </div>
  );
}
