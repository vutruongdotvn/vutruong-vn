"use client";

import { usePathname } from "next/navigation";
import PageTransition from "@/components/PageTransition";

type ConditionalPageTransitionProps = {
  children: React.ReactNode;
};

export default function ConditionalPageTransition({
  children,
}: ConditionalPageTransitionProps) {
  const pathname = usePathname();

  const disableTransition =
    pathname === "/watch" || pathname.startsWith("/watch/");

  if (disableTransition) {
    return <>{children}</>;
  }

  return <PageTransition>{children}</PageTransition>;
}