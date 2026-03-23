"use client";

import Link from "next/link";
import PostImages from "./PostImages";

type Props = {
  content: string;
  images?: string[];
  postId: string;
  truncate?: boolean;
  maxLength?: number;
};

export default function PostBody({
  content,
  images = [],
  postId,
  truncate = false,
  maxLength = 250,
}: Props) {
  const isLong = content.length > maxLength;

  const displayContent =
    truncate && isLong
      ? content.slice(0, maxLength) + "..."
      : content;

  return (
    <>
      <div className="postBody mt-3 text-gray-800 leading-relaxed whitespace-pre-line">
        {displayContent}

        {truncate && isLong && (
          <Link
            title="Xem chi tiết"
            href={`/blog/${postId}`}
            className="text-gray-800 font-medium hover:text-black"
          >
            Xem thêm
          </Link>
        )}
      </div>

      <PostImages images={images} postId={postId} />
    </>
  );
}