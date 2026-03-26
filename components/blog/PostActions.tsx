"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";

type PostActionsProps = {
  postId: string;
  postTitle?: string;
};

export default function PostActions({ postId, postTitle }: PostActionsProps) {
  const { showToast } = useToast();
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing) return;

    setSharing(true);

    const url = `${window.location.origin}/blog/${postId}`;
    const shareData = {
      title: postTitle || "Bài viết từ Vũ Trường",
      text: postTitle || "Xem bài viết này nhé",
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        showToast("Đã mở bảng chia sẻ", "success");
        return;
      }

      await navigator.clipboard.writeText(url);
      showToast("Đã sao chép liên kết", "success");
    } catch (error: any) {
      if (error?.name === "AbortError") return;

      console.error("Share failed:", error);
      showToast("Không thể chia sẻ liên kết", "error");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="postAction flex items-center gap-3 p-3">
      <button
        onClick={handleShare}
        disabled={sharing}
        className="cursor-pointer text-gray-600 transition hover:text-black active:scale-95 disabled:opacity-50"
        title="Chia sẻ"
      >
        <i
          className={
            sharing
              ? "fa-duotone fa-loader-third fa-spin"
              : "fa-duotone fa-share"
          }
        />
      </button>
    </div>
  );
}