import { notFound, redirect } from "next/navigation";
import BlogDetailRealtime from "@/components/blog/BlogDetailRealtime";
import { getPostDetailData } from "@/lib/getPostDetailData";
import {
  findPostImageIndex,
  isValidPostImageId,
  normalizePostImageUrls,
} from "@/lib/postImageRoute";
import { isValidPostId } from "@/lib/getPostRouteState";

type BlogPostImageFallbackPageProps = {
  params: Promise<{ id: string; imageId: string }>;
};

// Không cache HTML route chi tiết để thay đổi visibility có hiệu lực ngay.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogPostImageFallbackPage({
  params,
}: BlogPostImageFallbackPageProps) {
  const { id, imageId } = await params;

  if (!isValidPostId(id) || !isValidPostImageId(imageId)) notFound();

  const detail = await getPostDetailData(id);

  if (!detail) notFound();

  // Public post đã có dữ liệu ở server nên kiểm tra quan hệ ảnh ngay, tránh
  // render trang rồi mới sửa URL. Privacy post tiếp tục được kiểm tra sau khi
  // client xác thực phiên admin và tải nội dung như route chi tiết hiện tại.
  if (detail.initialPost) {
    const images = normalizePostImageUrls(detail.initialPost.images);

    if (findPostImageIndex(images, imageId) < 0) {
      redirect(`/blog/post/${id}`);
    }
  }

  return <BlogDetailRealtime {...detail} initialImageId={imageId} />;
}
