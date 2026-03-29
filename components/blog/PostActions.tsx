"use client";

import { useState } from "react";
import { useToast } from "@/hooks/useToast";

type PostActionsProps = {
  postId: string;
  postTitle?: string;
  postDescription?: string;
};

export default function PostActions({
  postId,
  postTitle,
  postDescription,
}: PostActionsProps) {
  const { showToast } = useToast();
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing) return;

    setSharing(true);

    const url = `${window.location.origin}/blog/${postId}`;

    const shareData = {
      title: postTitle?.trim() || "VT Zone",
      text: postDescription?.trim() || postTitle?.trim() || "Xem bài viết này nhé",
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        // showToast("Đã mở bảng chia sẻ", "success");
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
    <div className="postAction flex items-center gap-3 px-5 py-4">
      {/*<button
      onClick={() => showToast("Tính năng Yêu thích đang được phát triển", "warning")}
      className="cursor-pointer text-gray-500 transition hover:text-black active:scale-95 active:text-red-600"
    >
      <i className="fa-duotone fa-heart" />
    </button>
      <button
      onClick={() => showToast("Tính năng Bình luận đang được phát triển", "warning")}
      className="cursor-pointer text-gray-500 transition hover:text-black active:scale-95 active:text-red-600"
    >
      <i className="fa-duotone fa-comment" />
    </button>*/}
      <button
        onClick={handleShare}
        disabled={sharing}
        className="cursor-pointer text-gray-500 transition hover:text-black active:scale-90 active:text-red-600 disabled:opacity-50"
        title="Chia sẻ"
      >
        <i
          className={
            sharing
              ? "fa-duotone fa-spinner-third fa-spin"
              : "fa-duotone fa-share"
          }
        />
      </button>
    </div>
  );
}