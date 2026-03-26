import React from "react";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import {
  extractPostTitle,
  extractPostDescription,
} from "@/lib/postMeta";

type Props = {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
};

type Post = {
  id: string;
  content?: any;
  cover_image?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const SITE_URL = "https://www.vutruong.vn";
const SITE_NAME = "VT Zone";
const FALLBACK_OG = `${SITE_URL}/og.png`;
const FALLBACK_DESCRIPTION = "Xem bài viết này trên VT Zone";

/* ---------------------------------- */
/* Helpers */
/* ---------------------------------- */

function decodeHtmlEntities(text: string) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

/**
 * Chỉ loại bỏ markdown formatting
 * - GIỮ NGUYÊN hashtag (#nextjs)
 * - GIỮ NGUYÊN raw link (https://...)
 */
function stripMarkdown(text: string) {
  return text
    // code block
    .replace(/```[\s\S]*?```/g, " ")
    // inline code
    .replace(/`([^`]+)`/g, "$1")
    // markdown image ![alt](url) => alt
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    // markdown link [text](url) => text
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    // bold / italic / strike
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    // heading markdown: "# Title" ở đầu dòng
    // chỉ remove khi có khoảng trắng sau dấu #
    // nên "#nextjs" sẽ KHÔNG bị ảnh hưởng
    .replace(/^#{1,6}\s+/gm, "")
    // blockquote
    .replace(/^>\s+/gm, "")
    // unordered list
    .replace(/^[-*+]\s+/gm, "")
    // ordered list
    .replace(/^\d+\.\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHtml(html: string) {
  const cleaned = decodeHtmlEntities(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );

  return stripMarkdown(cleaned);
}

function safeJsonParse(value: string) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function extractUrlsFromString(text: string) {
  if (!text) return [];
  const matches = text.match(/https?:\/\/[^\s"'<>]+/g);
  return matches || [];
}

function isImageUrl(url: string) {
  return /\.(jpg|jpeg|png|webp|gif|avif|svg)(\?.*)?$/i.test(url);
}

/**
 * (Giữ nguyên để tương thích logic hiện tại)
 */
function normalizeContent(content: any): string {
  if (!content) return "";

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content) || typeof content === "object") {
    return JSON.stringify(content);
  }

  return String(content);
}

/**
 * Lấy dòng đầu tiên
 */
function getFirstMeaningfulLine(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines[0] || "";
}

/**
 * Nếu chỉ có 1 dòng nhưng nhiều câu => chỉ lấy câu đầu tiên
 */
function getFirstSentence(text: string) {
  return (
    text.match(/.*?[.!?…](?=\s|$)/)?.[0]?.trim() ||
    text.trim()
  );
}

/**
 * Title:
 * - Ưu tiên dòng đầu tiên
 * - Nếu dòng đầu tiên nhiều câu -> chỉ lấy câu đầu tiên
 */
function extractTitleText(content: any): string {
  const plain = extractPlainText(content);
  if (!plain) return "";

  const firstLine = getFirstMeaningfulLine(plain);
  if (!firstLine) return "";

  return getFirstSentence(firstLine).slice(0, 160).trim();
}

/**
 * Description:
 * - Giữ nguyên plain text sạch
 * - Không cắt hashtag
 * - Không đổi link
 */
function extractDescriptionText(content: any): string {
  const plain = extractPlainText(content);
  if (!plain) return FALLBACK_DESCRIPTION;

  return plain.slice(0, 200).trim() || FALLBACK_DESCRIPTION;
}

/**
 * Lấy plain text từ mọi kiểu content:
 * - HTML string
 * - JSON string
 * - object / array
 */
function extractPlainText(content: any): string {
  if (!content) return "";

  // 1) Nếu là string HTML/text
  if (typeof content === "string") {
    const parsed = safeJsonParse(content);

    // Nếu string này thực ra là JSON
    if (parsed) {
      return extractPlainText(parsed);
    }

    return stripHtml(content);
  }

  // 2) Nếu là array block
  if (Array.isArray(content)) {
    const texts = content
      .map((item) => extractPlainText(item))
      .filter(Boolean);

    return texts.join("\n").trim();
  }

  // 3) Nếu là object block
  if (typeof content === "object") {
    const priorityKeys = [
      "text",
      "caption",
      "content",
      "title",
      "body",
      "html",
      "description",
    ];

    const collected: string[] = [];

    for (const key of priorityKeys) {
      if (content[key]) {
        const value = extractPlainText(content[key]);
        if (value) collected.push(value);
      }
    }

    if (collected.length > 0) {
      return collected.join("\n").trim();
    }

    const fallbackCollected = Object.values(content)
      .map((value) => extractPlainText(value))
      .filter(Boolean);

    return fallbackCollected.join("\n").trim();
  }

  return "";
}

/**
 * Lấy ảnh đầu tiên từ:
 * - cover_image
 * - HTML string
 * - JSON string
 * - object / array block
 */
function extractFirstImage(content: any): string | null {
  if (!content) return null;

  // 1) String
  if (typeof content === "string") {
    // Nếu là HTML
    const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
    if (imgMatch?.[1]) return imgMatch[1];

    // Nếu là JSON string
    const parsed = safeJsonParse(content);
    if (parsed) {
      const fromParsed = extractFirstImage(parsed);
      if (fromParsed) return fromParsed;
    }

    // Nếu chỉ là text nhưng chứa URL ảnh
    const urls = extractUrlsFromString(content);
    const imageUrl = urls.find(isImageUrl);
    if (imageUrl) return imageUrl;

    return null;
  }

  // 2) Array
  if (Array.isArray(content)) {
    for (const item of content) {
      const found = extractFirstImage(item);
      if (found) return found;
    }
    return null;
  }

  // 3) Object
  if (typeof content === "object") {
    const imageKeys = ["src", "url", "image", "cover_image", "thumbnail"];

    for (const key of imageKeys) {
      const value = content[key];
      if (typeof value === "string" && isImageUrl(value)) {
        return value;
      }
    }

    for (const value of Object.values(content)) {
      const found = extractFirstImage(value);
      if (found) return found;
    }
  }

  return null;
}

function toAbsoluteUrl(url?: string | null) {
  if (!url) return FALLBACK_OG;

  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  if (url.startsWith("/")) {
    return `${SITE_URL}${url}`;
  }

  return `${SITE_URL}/${url}`;
}

async function getPost(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, content, cover_image, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("[SEO:getPost] error:", error);
    return null;
  }

  return data as Post;
}

/* ---------------------------------- */
/* Dynamic Metadata */
/* ---------------------------------- */

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  const url = `${SITE_URL}/blog/${id}`;

  if (!post) {
    return {
      title: "Bài viết không tồn tại",
      description: FALLBACK_DESCRIPTION,
      alternates: {
        canonical: url,
      },
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title: "Bài viết không tồn tại",
        description: FALLBACK_DESCRIPTION,
        url,
        siteName: SITE_NAME,
        locale: "vi_VN",
        type: "article",
        images: [
          {
            url: FALLBACK_OG,
            width: 1200,
            height: 630,
            alt: "VT Zone",
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: "Bài viết không tồn tại",
        description: FALLBACK_DESCRIPTION,
        images: [FALLBACK_OG],
      },
    };
  }

  const titleText = extractPostTitle(post.content);
const descriptionText = extractPostDescription(post.content);
  const firstImage = extractFirstImage(post.content);

  // Ưu tiên cover_image, nếu không có thì lấy ảnh đầu tiên trong bài
  const ogImage = toAbsoluteUrl(post.cover_image || firstImage || FALLBACK_OG);

  const title = titleText || "Bài viết";
  const description = descriptionText || FALLBACK_DESCRIPTION;

  return {
    title: `${title}`,
    description,
    alternates: {
      canonical: url,
    },
    authors: [
      {
        name: "Vũ Trường",
        url: SITE_URL,
      },
    ],
    category: "blog",
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      locale: "vi_VN",
      type: "article",
      publishedTime: post.created_at || undefined,
      modifiedTime: post.updated_at || post.created_at || undefined,
      authors: ["Vũ Trường"],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

/* ---------------------------------- */
/* Layout */
/* ---------------------------------- */

export default function BlogPostLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}