"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";

export default function LayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const hideNavbar =
    // pathname === "/hi" || pathname.startsWith("/router_need_to_hide_Navbar"); thêm router để ẩn Navbar
    pathname === "/hi";
    
  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}