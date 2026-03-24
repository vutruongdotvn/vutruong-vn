"use client";

import { useState } from "react";
import PostImages from "./PostImages";

type Props = {
  content: string;
  images?: string[];
  postId: string;
  truncate?: boolean;
  maxLength?: number;
  priority?: boolean;
};

export default function PostBody({
  content,
  images = [],
  postId,
  truncate = false,
  maxLength = 200,
  priority = false,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const isLong = content.length > maxLength;

  const displayContent =
    truncate && isLong && !isExpanded
      ? content.slice(0, maxLength) + "..."
      : content;

  return (
    <>
      <div className="postBody text-base mt-3 px-3 text-gray-800 whitespace-pre-line">
        {displayContent}

        {truncate && isLong && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="ml-1 text-gray-800 font-medium hover:text-black cursor-pointer"
          >
            {isExpanded ? "Thu gọn" : "Xem thêm"}
          </button>
        )}
      </div>

      <PostImages
        images={images}
        postId={postId}
        priority={priority}
      />
    </>
  );
}