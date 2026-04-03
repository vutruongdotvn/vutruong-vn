"use client";

import { useMemo, useState } from "react";
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

  const normalizedContent = useMemo(() => normalizePostContent(content), [content]);
  const isLong = normalizedContent.length > maxLength;
  const isCollapsed = truncate && isLong && !isExpanded;

  // Full content giữ nguyên format paragraph
  const fullParagraphs = useMemo(
    () => getPostParagraphs(normalizedContent),
    [normalizedContent]
  );

  // Preview content kiểu Facebook: flatten toàn bộ về 1 dòng logic
  const previewText = useMemo(() => {
    const flat = fullParagraphs
      .map((p) => p.trim())
      .filter(Boolean)
      .join(" ");

    return smartTruncatePostContent(flat, maxLength);
  }, [fullParagraphs, maxLength]);

  const renderInlineParts = (text: string) => {
    const inlineParts = parsePostInline(text);

    return inlineParts.map((part, partIndex) => {
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
            className="text-sky-800 font-medium hover:text-black break-words"
          >
            {part.value}
          </Link>
        );
      }

      if (part.type === "hashtag") {
        const tagName = part.value.replace(/^#/, "").trim().toLowerCase();

        return (
          <Link
            title={`Xem hashtag #${encodeURIComponent(tagName)}`}
            key={partIndex}
            href={`/blog/tag/${encodeURIComponent(tagName)}`}
            className="text-gray-800 font-medium hover:text-sky-800 active:scale-97 inline-flex break-words"
          >
            {part.value}
          </Link>
        );
      }

      return <span key={partIndex}>{part.value}</span>;
    });
  };

  return (
    <>
      <div className="postBody text-left pt-3 px-3 sm:px-5 text-gray-900">
  {isCollapsed ? (
    <div className="postShortPreview text-sm/6 sm:text-base/6 break-words overflow-hidden">
      {renderInlineParts(previewText)}

      <button
        title="Xem toàn bộ bài viết"
        onClick={() => setIsExpanded(true)}
        className="ml-1 inline-flex items-center gap-1 align-baseline whitespace-nowrap font-medium text-gray-800 hover:underline cursor-pointer"
      >
        <span>Xem thêm</span>
      </button>
    </div>
  ) : (
    fullParagraphs.map((paragraph, index) => {
      const isLast = index === fullParagraphs.length - 1;

      return (
        <p
          key={index}
          className="postParagraph mb-3 text-sm/6 sm:text-base/6 whitespace-pre-line break-words last:mb-0"
        >
          {renderInlineParts(paragraph)}

          {/*isLast && truncate && isLong && (
            <button
              title="Thu gọn"
              onClick={() => setIsExpanded(false)}
              className="ml-1 align-baseline whitespace-nowrap font-medium text-gray-800 hover:text-black cursor-pointer"
            >
              <i className="fa-duotone fa-angle-up text-sm" />
            </button>
          )*/}
        </p>
      );
    })
  )}
</div>

      {Array.isArray(images) &&
        images.some((img) => typeof img === "string" && img.trim() !== "") && (
          <PostImages
            images={images}
            postId={postId}
            priority={priority}
          />
        )}
    </>
  );
}