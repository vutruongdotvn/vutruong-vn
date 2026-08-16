"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";

function getRouteSection(pathname: string) {
  const firstSegment = pathname.split("/").find(Boolean);
  return firstSegment ? `/${firstSegment}` : "/";
}

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const routeSection = getRouteSection(pathname);

  return (
    <AnimatePresence mode="wait">
      <motion.div
        // Chỉ remount khi chuyển khu vực cấp cao như /blog -> /about.
        // Các route nội bộ /blog/* giữ nguyên app/blog/layout.tsx.
        key={routeSection}
        initial={{ y: 0, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 1,
          ease: "easeOut",
        }}
        className="min-h-screen will-change-opacity"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}