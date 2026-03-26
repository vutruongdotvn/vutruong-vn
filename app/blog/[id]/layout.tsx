import type { Metadata } from "next";
import { ReactNode } from "react";
import { supabase } from "@/lib/supabase";

type Props = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

type Post = {
  id: string;
  title?: string | null;
  content?: string | null;
  cover_image?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const SITE_URL = "https://vutruong.vn";
const SITE_NAME = "VT Zone";
const FALLBACK_OG = `${SITE_URL}/og.png`;
const FALLBACK_DESCRIPTION = "Xem bài viết này trên VT Zone";

/**
 * Loại bỏ HTML để lấy text sạch
 */
function stripHtml(html: string) {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Lấy câu đầu tiên có nghĩa từ nội dung bài viết
 */
function extractFirstSentence(content?: string | null) {
  if (!content) return FALLBACK_DESCRIPTION;

  const plain = stripHtml(content);
  if (!plain) return FALLBACK_DESCRIPTION;

  const firstSentence =
    plain.match(/.*?[.!?…](\s|$)/)?.[0]?.trim() ||
    plain.split("\n").find((line) => line.trim().length > 0)?.trim() ||
    plain;

  return firstSentence.slice(0, 160);
}

/**
 * Tự động lấy ảnh đầu tiên trong nội dung HTML
 */
function extractFirstImageFromContent(content?: string | null) {
  if (!content) return null;

  const imgMatch = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (!imgMatch?.[1]) return null;

  return imgMatch[1];
}

/**
 * Chuyển URL tương đối thành tuyệt đối
 */
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

/**
 * Lấy dữ liệu bài viết
 */
async function getPost(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("id, title, content, cover_image, created_at, updated_at")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Post;
}

/**
 * Metadata động cho từng bài viết
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const post = await getPost(id);

  if (!post) {
    const url = `${SITE_URL}/blog/${id}`;

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
        images: [
          {
            url: FALLBACK_OG,
            width: 1200,
            height: 630,
            alt: "VT Zone",
          },
        ],
        locale: "vi_VN",
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: "Bài viết không tồn tại | VT Zone",
        description: FALLBACK_DESCRIPTION,
        images: [FALLBACK_OG],
      },
    };
  }

  const title = post.title?.trim() || "Bài viết | VT Zone";
  const description = extractFirstSentence(post.content);
  const contentImage = extractFirstImageFromContent(post.content);
  const ogImage = toAbsoluteUrl(post.cover_image || contentImage || FALLBACK_OG);
  const url = `${SITE_URL}/blog/${post.id}`;

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

export default function BlogPostLayout({ children }: Props) {
  return <>{children}</>;
}