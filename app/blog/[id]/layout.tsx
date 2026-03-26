import React from "react";
import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";

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

function stripHtml(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
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
 * Lấy text đầu tiên có nghĩa từ mọi kiểu content:
 * - HTML string
 * - JSON string
 * - object / array
 */
function extractFirstText(content: any): string {
  if (!content) return FALLBACK_DESCRIPTION;

  // 1) Nếu là string HTML/text
  if (typeof content === "string") {
    const parsed = safeJsonParse(content);

    // Nếu string này thực ra là JSON
    if (parsed) {
      return extractFirstText(parsed);
    }

    const plain = stripHtml(content);
    if (!plain) return FALLBACK_DESCRIPTION;

    const firstSentence =
      plain.match(/.*?[.!?…](\s|$)/)?.[0]?.trim() ||
      plain.split("\n").find((line) => line.trim().length > 0)?.trim() ||
      plain;

    return firstSentence.slice(0, 160) || FALLBACK_DESCRIPTION;
  }

  // 2) Nếu là array block
  if (Array.isArray(content)) {
    for (const item of content) {
      const found = extractFirstText(item);
      if (found && found !== FALLBACK_DESCRIPTION) return found;
    }
    return FALLBACK_DESCRIPTION;
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

    for (const key of priorityKeys) {
      if (content[key]) {
        const found = extractFirstText(content[key]);
        if (found && found !== FALLBACK_DESCRIPTION) return found;
      }
    }

    for (const value of Object.values(content)) {
      const found = extractFirstText(value);
      if (found && found !== FALLBACK_DESCRIPTION) return found;
    }
  }

  return FALLBACK_DESCRIPTION;
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
      title: "Bài viết không tồn tại | VT Zone",
      description: FALLBACK_DESCRIPTION,
      alternates: {
        canonical: url,
      },
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title: "Bài viết không tồn tại | VT Zone",
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
        title: "Bài viết không tồn tại | VT Zone",
        description: FALLBACK_DESCRIPTION,
        images: [FALLBACK_OG],
      },
    };
  }

  const firstText = extractFirstText(post.content);
  const firstImage = extractFirstImage(post.content);

  // Theo yêu cầu của bạn:
  // Ưu tiên cover_image, nếu không có thì lấy ảnh đầu tiên trong bài
  const ogImage = toAbsoluteUrl(post.cover_image || firstImage || FALLBACK_OG);

  // Theo yêu cầu của bạn:
  // title = câu đầu tiên trong postBody
  const title = firstText || "Bài viết | VT Zone";
  const description = firstText || FALLBACK_DESCRIPTION;

  return {
    title: `${title} | VT Zone`,
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
  return (
    <main className="relative min-h-screen py-20">
      <div className="max-w-2xl w-screen mx-auto">
        <section className="postFeeds">{children}</section>
      </div>
    </main>
  );
}