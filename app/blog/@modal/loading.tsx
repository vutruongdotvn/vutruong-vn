"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import ModalFullPostSkeleton from "@/components/blog/modal/ModalFullPostSkeleton";

export default function InterceptedPostLoading() {
  const router = useRouter();

  const closeModal = useCallback(() => {
    router.back();
  }, [router]);

  return <ModalFullPostSkeleton onClose={closeModal} />;
}
