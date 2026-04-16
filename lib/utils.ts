import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
// random ID 10 số
export const generatePostId = () => {
  return Math.floor(1000000000 + Math.random() * 9000000000).toString();
};

// hashtag parser
export const extractHashtags = (text: string) => {
  return text.match(/#\w+/g) || [];
};

// format time
export const formatTimeAgo = (date: string) => {
  const now = new Date();
  const postDate = new Date(date);
  const diff = Math.floor((now.getTime() - postDate.getTime()) / 1000);

  if (diff < 60) return "Vừa xong";
  if (diff < 3600) return `${Math.floor(diff / 60)} phút`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} giờ`;
  if (diff < 172800) return "Hôm qua";

  const days = Math.floor(diff / 86400);
  if (days < 7) return `${days} ngày`;

  // 👉 format full
  const day = postDate.getDate();
  const month = postDate.getMonth() + 1;
  const year = postDate.getFullYear();

  const hours = postDate.getHours().toString().padStart(2, "0");
  const minutes = postDate.getMinutes().toString().padStart(2, "0");

  // return `${day} tháng ${month}, ${year} lúc ${hours}:${minutes}`;
  // return `${day}/${month}/${year}`;
  return `${day} tháng ${month}, ${year}`;
};

// =========================
// POST CONTENT FORMATTER
// =========================

// Chuẩn hóa nội dung bài viết:
// - Windows line break -> Unix
// - xóa space/tab thừa cuối dòng
// - nhiều dòng trống liên tiếp -> tối đa 1 dòng trống
export const normalizePostContent = (text: string) => {
  if (!text) return "";

  return text
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
};

// Tách nội dung thành từng đoạn giống Facebook
// - mỗi đoạn cách nhau bởi 1 blank line
// - vẫn giữ xuống dòng bên trong cùng 1 đoạn
export const getPostParagraphs = (text: string) => {
  return normalizePostContent(text)
    .split("\n\n")
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
};

// =========================
// INLINE TEXT FORMATTER
// =========================

export type PostInlinePart =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "link"; value: string }
  | { type: "hashtag"; value: string };

// Parse:
// - **bold**
// - auto URL
export const parsePostInline = (text: string): PostInlinePart[] => {
  if (!text) return [];

  const parts: PostInlinePart[] = [];

  // Ưu tiên match:
  // 1. **bold**
  // 2. URL
  // 3. hashtag
  const regex = /(\*\*([^*]+)\*\*)|(https?:\/\/[^\s]+)|(#\w+)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const fullMatch = match[0];
    const boldText = match[2];
    const url = match[3];
    const hashtag = match[4];
    const start = match.index;

    if (start > lastIndex) {
      parts.push({
        type: "text",
        value: text.slice(lastIndex, start),
      });
    }

    if (boldText) {
      parts.push({
        type: "bold",
        value: boldText,
      });
    } else if (url) {
      parts.push({
        type: "link",
        value: url,
      });
    } else if (hashtag) {
      parts.push({
        type: "hashtag",
        value: hashtag,
      });
    }

    lastIndex = start + fullMatch.length;
  }

  if (lastIndex < text.length) {
    parts.push({
      type: "text",
      value: text.slice(lastIndex),
    });
  }

  return parts;
};

// =========================
// SMART TRUNCATE
// =========================

// Cắt text "thông minh":
// - hạn chế cắt giữa từ
// - không để dangling ** hoặc URL / hashtag bị cụt quá xấu
export const smartTruncatePostContent = (
  text: string,
  maxLength: number
) => {
  const normalized = normalizePostContent(text);

  if (normalized.length <= maxLength) return normalized;

  let truncated = normalized.slice(0, maxLength);

  // Không cắt giữa từ nếu có thể
  const lastSpace = truncated.lastIndexOf(" ");
  if (lastSpace > maxLength * 0.7) {
    truncated = truncated.slice(0, lastSpace);
  }

  // Nếu số lượng ** bị lẻ -> bỏ phần ** cuối cùng để tránh bold hỏng
  const boldMatches = truncated.match(/\*\*/g);
  if (boldMatches && boldMatches.length % 2 !== 0) {
    const lastBoldIndex = truncated.lastIndexOf("**");
    if (lastBoldIndex !== -1) {
      truncated = truncated.slice(0, lastBoldIndex).trimEnd();
    }
  }

  // Nếu đang cắt giữa URL
  truncated = truncated.replace(/https?:\/\/[^\s]*$/g, "").trimEnd();

  // Nếu đang cắt giữa hashtag cuối
  truncated = truncated.replace(/#\w*$/g, "").trimEnd();

  return truncated + "...";
};

// =========================
// VIDEO EMBED (YOUTUBE)
// =========================

export const extractYouTubeId = (url: string): string | null => {
  if (!url) return null;

  const regex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

  const match = url.match(regex);
  return match ? match[1] : null;
};

// detect video
export type PostBlock =
  | { type: "text"; value: string }
  | { type: "youtube"; videoId: string };

export const parsePostBlocks = (text: string): PostBlock[] => {
  if (!text) return [];

  const lines = text.split("\n");

  return lines.map((line) => {
    const trimmed = line.trim();

    const videoId = extractYouTubeId(trimmed);

    if (videoId) {
      return {
        type: "youtube",
        videoId,
      };
    }

    return {
      type: "text",
      value: line,
    };
  });
};