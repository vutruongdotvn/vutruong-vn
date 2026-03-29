"use client";

import { useRef } from "react";
import { useToastContext } from "@/components/ui/ToastProvider";

export function useToast() {
  const toast = useToastContext();

  const lastToastRef = useRef<{
    message: string;
    type: string;
    time: number;
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" | "info" | "warning" = "info"
  ) => {
    const now = Date.now();

    // Chặn spam cùng 1 toast trong 1200ms
    if (
      lastToastRef.current &&
      lastToastRef.current.message === message &&
      lastToastRef.current.type === type &&
      now - lastToastRef.current.time < 1500
    ) {
      return;
    }

    lastToastRef.current = {
      message,
      type,
      time: now,
    };

    toast.showToast(message, type);
  };

  return {
    ...toast,
    showToast,
  };
}