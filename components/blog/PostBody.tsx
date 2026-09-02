"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PostEmbed from "@/components/blog/PostEmbed";
import {
  extractYouTubeId,
  getPostParagraphs,
  normalizePostContent,
  parsePostBlocks,
  parsePostInline,
  smartTruncatePostContent,
  type PostBlock,
} from "@/lib/utils";
import PostImages from "./PostImages";

const MOBILE_MEDIA_QUERY = "(max-width: 767px)";
const MOBILE_PREVIEW_LENGTH = 90;
const DESKTOP_PREVIEW_LENGTH = 230;

type Props = {
  content: string;
  images?: string[];
  postId: string;
  truncate?: boolean;
  /**
   * Giới hạn cố định cho mọi kích thước màn hình.
   * Bỏ trống để dùng mặc định responsive: mobile 90, desktop 220 ký tự.
   */
  maxLength?: number;
  priority?: boolean;
};

function getSafeExternalHref(value: string) {
  let href = value.trim().replace(/[.,;:]+$/g, "");

  const unbalancedClosers: Record<string, string> = {
    ")": "(",
    "]": "[",
    "}": "{",
  };

  while (href) {
    const closer = href[href.length - 1];
    const opener = closer ? unbalancedClosers[closer] : undefined;

    if (!closer || !opener) break;

    const openerCount = href.split(opener).length - 1;
    const closerCount = href.split(closer).length - 1;

    if (closerCount <= openerCount) break;
    href = href.slice(0, -1);
  }

  return /^https?:\/\//i.test(href) ? href : null;
}

function parseParagraphBlocks(paragraph: string): PostBlock[] {
  return paragraph.split("\n").flatMap<PostBlock>((line) => {
    const [block] = parsePostBlocks(line);

    if (!block || block.type !== "youtube") {
      return block ? [block] : [];
    }

    // parsePostBlocks coi cả dòng là video nếu tìm thấy URL YouTube. Giữ lại
    // phần chữ đứng trước/sau URL để nội dung không bị mất khi render.
    const videoUrl = line
      .match(/https?:\/\/[^\s]+/gi)
      ?.find((url) => extractYouTubeId(url) === block.videoId);

    if (!videoUrl) {
      return [block];
    }

    const videoUrlIndex = line.indexOf(videoUrl);
    const beforeVideo = line.slice(0, videoUrlIndex).trim();
    const afterVideo = line.slice(videoUrlIndex + videoUrl.length).trim();
    const blocks: PostBlock[] = [];

    if (beforeVideo) blocks.push({ type: "text", value: beforeVideo });
    blocks.push(block);
    if (afterVideo) blocks.push({ type: "text", value: afterVideo });

    return blocks;
  });
}

function renderInlineParts(text: string, enableLinks = true) {
  return parsePostInline(text).map((part, partIndex) => {
    const key = `${part.type}-${partIndex}`;

    if (part.type === "bold") {
      return (
        <strong key={key} className="font-medium">
          {part.value}
        </strong>
      );
    }

    if (part.type === "link") {
      if (!enableLinks) {
        return <span key={key}>{part.value}</span>;
      }

      const href = getSafeExternalHref(part.value);

      if (!href) {
        return <span key={key}>{part.value}</span>;
      }

      return (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="break-words font-medium text-foreground hover:underline active:opacity-80"
        >
          {part.value}
        </a>
      );
    }

    if (part.type === "hashtag") {
      if (!enableLinks) {
        return <span key={key}>{part.value}</span>;
      }

      const tagName = part.value
        .replace(/^#/, "")
        .trim()
        .normalize("NFC")
        .toLowerCase();

      if (!tagName) {
        return <span key={key}>{part.value}</span>;
      }

      return (
        <Link
          key={key}
          title={`Xem hashtag #${tagName}`}
          href={`/blog/tag/${encodeURIComponent(tagName)}`}
          prefetch={false}
          className="break-words font-medium text-foreground hover:underline active:opacity-80"
        >
          {part.value}
        </Link>
      );
    }

    return <span key={key}>{part.value}</span>;
  });
}

export default function PostBody({
  content,
  images,
  postId,
  truncate = false,
  maxLength,
  priority = false,
}: Props) {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const fixedMaxLength =
    typeof maxLength === "number" &&
      Number.isFinite(maxLength) &&
      maxLength >= 1
      ? Math.floor(maxLength)
      : undefined;

  useEffect(() => {
    // maxLength được truyền vào là giới hạn cố định, không cần theo dõi màn hình.
    if (fixedMaxLength !== undefined) {
      return;
    }

    const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
    const updateIsMobile = () => setIsMobile(mediaQuery.matches);

    updateIsMobile();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updateIsMobile);
      return () => mediaQuery.removeEventListener("change", updateIsMobile);
    }

    // Fallback cho Safari cũ.
    mediaQuery.addListener(updateIsMobile);
    return () => mediaQuery.removeListener(updateIsMobile);
  }, [fixedMaxLength]);

  const responsiveMaxLength =
    fixedMaxLength ??
    (isMobile ? MOBILE_PREVIEW_LENGTH : DESKTOP_PREVIEW_LENGTH);

  const normalizedContent = useMemo(
    () => normalizePostContent(content ?? ""),
    [content]
  );

  const paragraphBlocks = useMemo(
    () =>
      getPostParagraphs(normalizedContent)
        .map(parseParagraphBlocks)
        .filter((blocks) => blocks.length > 0),
    [normalizedContent]
  );

  const previewSource = useMemo(
    () =>
      paragraphBlocks
        .flatMap((blocks) =>
          blocks.flatMap((block) =>
            block.type === "youtube" ? [] : [block.value.trim()]
          )
        )
        .filter(Boolean)
        .join(" "),
    [paragraphBlocks]
  );

  const previewText = useMemo(
    () => smartTruncatePostContent(previewSource, responsiveMaxLength),
    [previewSource, responsiveMaxLength]
  );

  const collapsedVideoBlocks = useMemo(() => {
    const seenVideoIds = new Set<string>();

    return paragraphBlocks
      .flatMap((blocks) =>
        blocks.flatMap((block) =>
          block.type === "youtube" ? [block] : []
        )
      )
      .filter((block) => {
        const videoId = block.videoId.trim();

        if (!videoId || seenVideoIds.has(videoId)) {
          return false;
        }

        seenVideoIds.add(videoId);
        return true;
      });
  }, [paragraphBlocks]);

  const validImages = useMemo(() => {
    if (!Array.isArray(images)) {
      return [];
    }

    return images
      .filter(
        (image): image is string =>
          typeof image === "string" && image.trim() !== ""
      )
      .map((image) => image.trim());
  }, [images]);

  const hasBodyContent = paragraphBlocks.some((blocks) =>
    blocks.some((block) =>
      block.type === "youtube"
        ? block.videoId.trim() !== ""
        : block.value.trim() !== ""
    )
  );
  const hasHiddenText = previewText !== previewSource;
  const isCollapsed = truncate && hasHiddenText && !isExpanded;

  return (
    <>
      {hasBodyContent && (
        <div className="postBody">
          {isCollapsed ? (
            <>
              <button
                type="button"
                onClick={() => setIsExpanded(true)}
                title="Xem toàn bộ bài viết"
                aria-label="Mở rộng toàn bộ nội dung bài viết"
                className="postShortPreview block w-full cursor-pointer break-words px-3 text-left text-[.9375rem]/6 text-foreground hover:text-foreground sm:px-4"
              >
                {renderInlineParts(previewText, false)}

                <span
                  aria-hidden="true"
                  className="ml-1 inline-flex cursor-pointer items-center whitespace-nowrap align-baseline font-medium text-foreground hover:underline"
                >
                  Xem thêm
                </span>
              </button>

              {collapsedVideoBlocks.map((block) => (
                <PostEmbed
                  key={block.videoId.trim()}
                  videoId={block.videoId.trim()}
                />
              ))}
            </>
          ) : (
            paragraphBlocks.map((blocks, paragraphIndex) => (
              <div
                key={paragraphIndex}
                className="postParagraph mb-3 last:mb-0"
              >
                {blocks.map((block, blockIndex) => {
                  if (block.type === "youtube") {
                    const videoId = block.videoId.trim();

                    return videoId ? (
                      <PostEmbed
                        key={`youtube-${videoId}-${blockIndex}`}
                        videoId={videoId}
                      />
                    ) : null;
                  }

                  if (!block.value.trim()) return null;

                  const textClassName =
                    "block whitespace-pre-line break-words px-3 text-[.9375rem]/6 text-foreground sm:px-4";

                  return (
                    <p
                      key={`text-${blockIndex}`}
                      className={textClassName}
                    >
                      {renderInlineParts(block.value)}
                    </p>
                  );
                })}
              </div>
            ))
          )}
        </div>
      )}

      {validImages.length > 0 && (
        <PostImages
          images={validImages}
          postId={postId}
          priority={priority}
          openPostOnClick={truncate}
        />
      )}
    </>
  );
}