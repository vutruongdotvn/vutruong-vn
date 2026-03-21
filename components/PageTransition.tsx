"use client";

import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 1, // nhanh gọn, không lề mề
          ease: "easeInOut",
        }}
        className="min-h-screen will-change-opacity"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}