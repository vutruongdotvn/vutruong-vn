const POST_IMAGE_ID_PATTERN = /^[A-Za-z0-9_-]{1,200}$/;

/**
 * Chuẩn hóa danh sách ảnh lấy từ dữ liệu chưa định kiểu mà không đổi thứ tự.
 */
export function normalizePostImageUrls(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (image): image is string =>
        typeof image === "string" && image.trim().length > 0,
    )
    .map((image) => image.trim());
}

export function isValidPostImageId(value: string): boolean {
  return POST_IMAGE_ID_PATTERN.test(value.trim());
}

/**
 * Lấy public ID cuối của ảnh từ URL Cloudinary đã lưu trong bài viết.
 *
 * Ví dụ:
 * /vutruong_vn/posts/nlnvlhwns3hyutfcw1nh.jpg
 * -> nlnvlhwns3hyutfcw1nh
 */
export function getPostImageId(imageUrl: string): string | null {
  const normalizedUrl = imageUrl.trim();
  if (!normalizedUrl) return null;

  try {
    const pathname = new URL(normalizedUrl).pathname;
    const encodedFilename = pathname.split("/").filter(Boolean).at(-1);
    if (!encodedFilename) return null;

    const filename = decodeURIComponent(encodedFilename);
    const extensionIndex = filename.lastIndexOf(".");
    const imageId = (
      extensionIndex > 0 ? filename.slice(0, extensionIndex) : filename
    ).trim();

    return isValidPostImageId(imageId) ? imageId : null;
  } catch {
    return null;
  }
}

export function findPostImageIndex(
  images: readonly string[],
  imageId: string | null | undefined,
): number {
  if (!imageId || !isValidPostImageId(imageId)) return -1;

  return images.findIndex((imageUrl) => getPostImageId(imageUrl) === imageId);
}

export function getPostImagePath(postId: string, imageUrl: string): string {
  const basePath = `/blog/post/${postId}`;
  const imageId = getPostImageId(imageUrl);

  return imageId ? `${basePath}/${encodeURIComponent(imageId)}` : basePath;
}
