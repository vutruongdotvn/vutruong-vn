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
      // text: postDescription?.trim() || postTitle?.trim() || "Xem bài viết này nhé",
      url,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        // showToast("Chia sẻ thành công!", "success");
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
    <div className="postAction flex items-center gap-4 px-4 py-3">
      {/* Buttons 
      <button
      onClick={() => showToast("Đăng nhập để Thích bài viết này.", "warning")}
      className="likeBtn cursor-pointer text-[.9375rem] sm:text-base text-gray-500 transition hover:text-black active:scale-80"
    >
      <i className="fadt fa-heart" />
    </button>
      <button
      onClick={() => showToast("Bình luận đã bị tắt cho bài viết này.", "error")}
      className="commentBtn cursor-pointer text-[.9375rem] sm:text-base text-gray-500 transition hover:text-black active:scale-80"
    >
      <i className="fadt fa-comment-slash" />
    </button>
    */}
      <button
        onClick={handleShare}
        disabled={sharing}
        className="shareBtn cursor-pointer text-[.9375rem] sm:text-base text-gray-500 transition hover:text-black active:scale-80 disabled:opacity-50"
        title="Chia sẻ"
      >
        <i
          className={
            sharing
              ? "fadt fa-spinner-third fa-spin"
              : "fadt fa-share"
          }
        />
      </button>
    </div>
  );
}