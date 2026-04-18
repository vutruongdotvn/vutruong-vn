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
    <div className={cn("group relative w-full mx-auto", className)}>
      
      {/* 🔮 MAIN GLASS SHELL (Lớp kính chính) */}
      <div
        className={cn(
          "relative overflow-hidden rounded-3xl sm:rounded-[2rem] border border-white/60 bg-white/40 backdrop-blur-2xl",
          "shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-500 ease-out",
          "hover:bg-white/50 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1",
          contentClassName
        )}
      >
        {/* 1. Inner Border Glow (Mô phỏng độ dày của tấm kính) */}
        <div className="pointer-events-none absolute inset-0 rounded-[inherit] ring-1 ring-inset ring-white/40" />

        {/* 2. Top Light Reflection (Phản xạ ánh sáng từ trên xuống) */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/50 to-transparent opacity-80" />

        {/* 3. DYNAMIC AMBIENT LIGHTS (Ánh sáng môi trường mờ ảo - Chuyển động khi hover) */}
        {/* Luồng sáng xanh dương ở đáy */}
        <div className="pointer-events-none absolute -bottom-1/4 left-1/2 h-1/2 w-3/4 -translate-x-1/2 rounded-full bg-sky-200/20 blur-[3rem] transition-all duration-700 group-hover:scale-110 group-hover:bg-sky-200/30" />
        
        {/* Luồng sáng tím ở góc trên phải */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-purple-200/20 blur-3xl transition-all duration-700 group-hover:translate-x-4 group-hover:translate-y-4 group-hover:bg-purple-200/30" />
        
        {/* Luồng sáng xanh lơ ở cạnh trái */}
        <div className="pointer-events-none absolute -left-12 bottom-1/4 h-32 w-32 rounded-full bg-blue-200/20 blur-3xl transition-all duration-700 group-hover:-translate-x-2 group-hover:scale-110" />

        {/* 4. Fine Grid Texture (Lưới pattern tinh tế - Tối ưu bằng mix-blend-overlay) */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.02] mix-blend-overlay transition-opacity duration-500 group-hover:opacity-[0.035]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: "24px 24px",
          }}
        />

        {/* 5. Vệt sáng lướt qua (Diagonal Shine Effect) - Kích hoạt khi Hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent transition-transform duration-[1200ms] ease-in-out group-hover:translate-x-full" />

        {/* 📦 CONTENT WRAPPER */}
        <div className="relative z-10 h-full w-full">{children}</div>
      </div>
    </div>
  );
}