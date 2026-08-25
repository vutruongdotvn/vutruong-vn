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
  return <PageTransition>{children}</PageTransition>;
}