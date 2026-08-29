import "server-only";

import type { Metadata } from "next";
import {
  getPostDetailData,
  type PostDetailData,
  type PublicPostDetail,
} from "@/lib/getPostDetailData";
import {
  extractPostDescription,
  extractPostTitle,
} from "@/lib/postMeta";

const SITE_URL = "https://www.vutruong.vn";
const SITE_NAME = "VT Zone";
const FALLBACK_OG = `${SITE_URL}/og.png`;
const FALLBACK_DESCRIPTION = "Xem bài viết này trên VT Zone";

const NOT_FOUND_METADATA: Metadata = {
  title: {
    absolute: "Không tìm thấy bài viết",
  },
  description: "Bài viết không tồn tại, đã bị xóa hoặc URL không chính xác.",
  robots: {
    index: false,
    follow: false,
  },
};

function getString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeContent(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function getFirstPostImage(post: PublicPostDetail): string | null {
  const coverImage = getString(post.cover_image);
  if (coverImage) return coverImage;

  if (Array.isArray(post.images)) {
    const firstImage = post.images.find(
      (image): image is string =>
        typeof image === "string" && image.trim().length > 0
    );

    if (firstImage) return firstImage.trim();
  }

  const content = normalizeContent(post.content);
  const htmlImage = content.match(/<img[^>]+src=["']([^"']+)["']/i)?.[1];

  if (htmlImage) return htmlImage;

  return (
    content.match(
      /https?:\/\/[^\s"'<>]+\.(?:jpe?g|png|webp|gif|avif)(?:\?[^\s"'<>]*)?/i
    )?.[0] ?? null
  );
}

function toAbsoluteUrl(value: string | null): string {
  if (!value) return FALLBACK_OG;
  if (/^https?:\/\//i.test(value)) return value;

  return `${SITE_URL}/${value.replace(/^\/+/, "")}`;
}

export function getPostDocumentTitle(detailData: PostDetailData): string {
  if (detailData.routeVisibility === "privacy") {
    return "Bài viết riêng tư";
  }

  const content = normalizeContent(detailData.initialPost?.content);
  return extractPostTitle(content) || "Bài viết";
}

export async function getPostMetadata(id: string): Promise<Metadata> {
  const detailData = await getPostDetailData(id);

  if (!detailData) return NOT_FOUND_METADATA;

  const url = `${SITE_URL}/blog/post/${id}`;

  if (detailData.routeVisibility === "privacy") {
    const title = getPostDocumentTitle(detailData);
    const description = "Bài viết này chỉ dành cho người có quyền truy cập.";

    return {
      title,
      description,
      alternates: {
        canonical: url,
      },
      robots: {
        index: false,
        follow: false,
      },
      openGraph: {
        title,
        description,
        url,
        siteName: SITE_NAME,
        locale: "vi_VN",
        type: "article",
        images: [
          {
            url: FALLBACK_OG,
            width: 1200,
            height: 630,
            alt: SITE_NAME,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [FALLBACK_OG],
      },
    };
  }

  const post = detailData.initialPost;
  if (!post) return NOT_FOUND_METADATA;

  const content = normalizeContent(post.content);
  const title = getPostDocumentTitle(detailData);
  const description =
    extractPostDescription(content) || FALLBACK_DESCRIPTION;
  const ogImage = toAbsoluteUrl(getFirstPostImage(post));
  const publishedTime = getString(post.created_at) ?? undefined;
  const modifiedTime = getString(post.updated_at) ?? publishedTime;

  return {
    title,
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
      publishedTime,
      modifiedTime,
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
