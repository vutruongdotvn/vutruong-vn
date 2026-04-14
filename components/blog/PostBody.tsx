"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PostImages from "./PostImages";
import {
  getPostParagraphs,
  normalizePostContent,
  parsePostInline,
  smartTruncatePostContent,
} from "@/lib/utils";
import { parsePostBlocks } from "@/lib/utils";
import PostEmbed from "@/components/blog/PostEmbed";

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
  const [responsiveMaxLength, setResponsiveMaxLength] = useState(maxLength);

  useEffect(() => {
    // Tailwind lg breakpoint: desktop >= 1024px
    // mobile + tablet: < 1024px
    const mediaQuery = window.matchMedia("(max-width: 767px)");

    const updateResponsiveMaxLength = () => {
      // Chỉ auto responsive khi đang dùng default maxLength = 180
      // Nếu component cha truyền maxLength custom vào thì giữ nguyên
      setResponsiveMaxLength(
        maxLength === 180
          ? mediaQuery.matches
            ? 130
            : 200
          : maxLength
      );
    };

    updateResponsiveMaxLength();

    // Safari cũ fallback
    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateResponsiveMaxLength);
      return () => {
        mediaQuery.removeEventListener("change", updateResponsiveMaxLength);
      };
    } else {
      mediaQuery.addListener(updateResponsiveMaxLength);
      return () => {
        mediaQuery.removeListener(updateResponsiveMaxLength);
      };
    }
  }, [maxLength]);

  const normalizedContent = useMemo(
    () => normalizePostContent(content),
    [content]
  );

  const isLong = normalizedContent.length > responsiveMaxLength;
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

    return smartTruncatePostContent(flat, responsiveMaxLength);
  }, [fullParagraphs, responsiveMaxLength]);

  const renderInlineParts = (text: string) => {
    const inlineParts = parsePostInline(text);

    return inlineParts.map((part, partIndex) => {
      if (part.type === "bold") {
        return (
          <strong
            key={partIndex}
            className="font-semibold"
          >
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
            className="text-sky-800 font-medium hover:underline active:scale-97 inline-flex break-words"
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
      <div className="postBody text-left pt-3 text-gray-800">
        {isCollapsed ? (
          <div className="postShortPreview sm:text-base/6 text-[.9375rem]/6 break-words overflow-hidden px-3 sm:px-4">
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

            // ✅ NEW: parse block
            const blocks = parsePostBlocks(paragraph);

            return (
              <div
                key={index}
                className="postParagraph mb-3 last:mb-0"
              >
                {blocks.map((block, blockIndex) => {
                  // 🎬 VIDEO EMBED
                  if (block.type === "youtube") {
                    return (
                      <PostEmbed
                        key={blockIndex}
                        videoId={block.videoId}
                      />
                    );
                  }

                  // 📝 TEXT (GIỮ NGUYÊN STYLE CŨ)
                  return (
                    <p
                      key={blockIndex}
                      className="sm:text-base/6 text-[.9375rem]/6 whitespace-pre-line break-words px-3 sm:px-4"
                    >
                      {renderInlineParts(block.value)}

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
                })}
              </div>
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