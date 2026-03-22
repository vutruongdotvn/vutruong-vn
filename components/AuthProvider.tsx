"use client";

import { useEffect } from "react";
import { createProfileIfNotExists } from "@/lib/auth";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    createProfileIfNotExists();
  }, []);

  return <>{children}</>;
}