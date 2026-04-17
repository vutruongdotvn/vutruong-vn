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
    <div className={cn("relative w-full mx-auto", className)}>

      {/* Main glass shell */}
      <div
        className={cn(
          "relative overflow-hidden rounded-4xl border border-white/45 bg-white/60 shadow-[0_18px_70px_rgba(0,0,0,0.06)] backdrop-blur-2xl transition-all duration-300 hover:shadow-[0_24px_90px_rgba(0,0,0,0.08)]",
          contentClassName
        )}
      >
        {/* Inner subtle border glow */}
        <div className="pointer-events-none absolute inset-[1px] rounded-[39px] border border-white/35" />

        {/* Top light gradient */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-white/35 via-white/10 to-transparent" />

        {/* Bottom ambient gradient */}
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-28 w-[70%] -translate-x-1/2 rounded-full bg-sky-100/20 blur-3xl" />

        {/* Side light */}
        <div className="pointer-events-none absolute -left-12 top-1/3 h-32 w-32 rounded-full bg-sky-100/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-12 bottom-1/3 h-32 w-32 rounded-full bg-purple-100/20 blur-3xl" />

        {/* Fine grid sheen */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(0,0,0,0.18) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.18) 1px, transparent 1px)
            `,
            backgroundSize: "28px 28px",
          }}
        />

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}