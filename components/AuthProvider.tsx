"use client";

import type { ReactNode } from "react";
import { UserProvider } from "@/hooks/useUser";

export default function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  return <UserProvider>{children}</UserProvider>;
}