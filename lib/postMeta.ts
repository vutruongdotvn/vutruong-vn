export const FALLBACK_DESCRIPTION = "Xem bài viết này trên VT Zone";

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
 * Chỉ remove markdown formatting
 * - GIỮ nguyên hashtag (#nextjs)
 * - GIỮ nguyên raw link
 */
function stripMarkdown(text: string) {
  return text
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/\*\*\*(.*?)\*\*\*/g, "$1")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/_(.*?)_/g, "$1")
    .replace(/~~(.*?)~~/g, "$1")
    // chỉ bỏ heading markdown kiểu "# Title"
    // KHÔNG đụng hashtag "#nextjs"
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s+/gm, "")
    .replace(/^[-*+]\s+/gm, "")
    .replace(/^\d+\.\s+/gm, "")
    .trim();
}

function stripHtml(html: string) {
  const cleaned = decodeHtmlEntities(
    html
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<[^>]+>/g, " ")
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

function getFirstMeaningfulLine(text: string) {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines[0] || "";
}

function getFirstSentence(text: string) {
  return text.match(/.*?[.!?…](?=\s|$)/)?.[0]?.trim() || text.trim();
}

/**
 * Plain text sạch từ content
 */
export function extractPlainText(content: any): string {
  if (!content) return "";

  if (typeof content === "string") {
    const parsed = safeJsonParse(content);
    if (parsed) return extractPlainText(parsed);
    return stripHtml(content);
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => extractPlainText(item))
      .filter(Boolean)
      .join("\n")
      .trim();
  }

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

    return Object.values(content)
      .map((value) => extractPlainText(value))
      .filter(Boolean)
      .join("\n")
      .trim();
  }

  return "";
}

/**
 * Title dùng cho:
 * - SEO title
 * - Share native title
 */
export function extractPostTitle(content: any) {
  const plain = extractPlainText(content);
  if (!plain) return "";

  const firstLine = getFirstMeaningfulLine(plain);
  if (!firstLine) return "";

  return getFirstSentence(firstLine).slice(0, 160).trim();
}

/**
 * Description dùng cho:
 * - meta description
 * - share native text
 */
export function extractPostDescription(content: any) {
  const plain = extractPlainText(content);
  if (!plain) return FALLBACK_DESCRIPTION;

  return plain.slice(0, 200).trim() || FALLBACK_DESCRIPTION;
}