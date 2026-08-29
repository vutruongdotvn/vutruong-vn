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
}: PostActionsProps) {
  const { showToast } = useToast();
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (sharing) return;

    setSharing(true);

    const url = `${window.location.origin}/blog/post/${postId}`;

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
    } catch (error: unknown) {
      if (error instanceof DOMException && error.name === "AbortError") return;

      console.error("Share failed:", error);
      showToast("Không thể chia sẻ liên kết", "error");
    } finally {
      setSharing(false);
    }
  };

  return (
    <div className="postAction flex items-center gap-4 px-4 py-3">
      {/* Buttons */}
      <button
        type="button"
        onClick={() => showToast("Đăng nhập để Thích bài viết này.", "warning")}
        aria-label="Thích bài viết"
        title="Thích bài viết"
        className="likeBtn cursor-pointer text-[.9375rem] text-gray-500 transition hover:text-black focus-visible:outline-none active:scale-80 sm:text-base"
      >
        <i className="fadt fa-heart" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={() => showToast("Bình luận đã bị tắt cho bài viết này.", "error")}
        aria-label="Bình luận đã bị tắt"
        title="Bình luận đã bị tắt"
        className="commentBtn cursor-pointer text-[.9375rem] text-gray-500 transition hover:text-black focus-visible:outline-none active:scale-80 sm:text-base"
      >
        <i className="fadt fa-comment-slash" aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={handleShare}
        disabled={sharing}
        aria-label={sharing ? "Đang chia sẻ" : "Chia sẻ bài viết"}
        aria-busy={sharing}
        className="shareBtn cursor-pointer text-[.9375rem] text-gray-500 transition hover:text-black focus-visible:outline-none active:scale-80 disabled:cursor-wait disabled:opacity-50 sm:text-base"
        title="Chia sẻ"
      >
        <i
          className={
            sharing
              ? "fadt fa-spinner-third fa-spin"
              : "fadt fa-share"
          }
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
