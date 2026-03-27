"use client";

import { useState } from "react";
import Link from "next/link";
import PostImages from "./PostImages";
import {
  getPostParagraphs,
  normalizePostContent,
  parsePostInline,
  smartTruncatePostContent,
} from "@/lib/utils";

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
  maxLength = 180,
  priority = false,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

  const normalizedContent = normalizePostContent(content);
  const isLong = normalizedContent.length > maxLength;

  const displayContent =
    truncate && isLong && !isExpanded
      ? smartTruncatePostContent(normalizedContent, maxLength)
      : normalizedContent;

  const paragraphs = getPostParagraphs(displayContent);

  return (
    <>
      <div className="postBody text-base/6 text-left mt-3 px-3 text-gray-800">
        {paragraphs.map((paragraph, index) => {
          const isLast = index === paragraphs.length - 1;
          const inlineParts = parsePostInline(paragraph);

          return (
            <p
              key={index}
              className="mb-3 text-base/6 whitespace-pre-line last:mb-0"
            >
              {inlineParts.map((part, partIndex) => {
                if (part.type === "bold") {
                  return (
                    <strong key={partIndex} className="font-semibold">
                      {part.value}
                    </strong>
                  );
                }

                if (part.type === "link") {
                  return (
                    <Link
                      key={partIndex}
                      href={part.value}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-800 font-medium hover:text-black break-all"
                    >
                      {part.value}
                    </Link>
                  );
                }

                if (part.type === "hashtag") {
                  const tagName = part.value.replace(/^#/, "");

                  return (
                    <Link
                      key={partIndex}
                      href={`/blog/tag/${encodeURIComponent(tagName)}`}
                      className="text-gray-800 font-medium hover:underline"
                    >
                      {part.value}
                    </Link>
                  );
                }

                return <span key={partIndex}>{part.value}</span>;
              })}

              {isLast && truncate && isLong && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-1 inline whitespace-nowrap font-medium text-gray-800 hover:underline cursor-pointer"
                >
                  {isExpanded ? "Thu gọn" : "Xem thêm"}
                </button>
              )}
            </p>
          );
        })}
      </div>

      <PostImages
        images={images}
        postId={postId}
        priority={priority}
      />
    </>
  );
}