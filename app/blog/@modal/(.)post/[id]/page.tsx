import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModalFullPostV2 from "@/components/blog/modal/ModalFullPostV2";
import { getPostMetadata } from "@/lib/getPostMetadata";
import { getPostRouteState, isValidPostId } from "@/lib/getPostRouteState";

type InterceptedPostPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: InterceptedPostPageProps): Promise<Metadata> {
  const { id } = await params;
  const routeState = await getPostRouteState(id);

  // Giữ nguyên metadata privacy/not-found. Metadata đầy đủ của URL canonical
  // /blog/post/[id] vẫn ở route chi tiết, không thay đổi SEO của trang đó.
  if (routeState?.visibility !== "public") return getPostMetadata(id);

  // Không gọi getPostMetadata/getPostDetailData cho public ở intercepted route:
  // chúng sẽ fetch lại toàn bộ post + profile ngay cả khi browser đã có cache.
  // Modal đặt document.title thật khi nội dung public đã được kiểm tra và tải.
  return {
    title: "Bài viết",
    description: "Xem bài viết này trên VT Zone",
    alternates: { canonical: `https://www.vutruong.vn/blog/post/${id}` },
    robots: { index: true, follow: true },
  };
}

export default async function InterceptedPostPage({
  params,
}: InterceptedPostPageProps) {
  const { id } = await params;
  if (!isValidPostId(id)) notFound();

  // Chỉ chờ lookup id/visibility. Không gửi nội dung bài vào Router Cache.
  // getPostRouteState dùng React cache để khử lookup trùng với metadata.
  const routeState = await getPostRouteState(id);
  const routeVisibility = routeState?.visibility ?? "public";

  return (
    <ModalFullPostV2
      key={`${id}:${routeVisibility}`}
      postId={id}
      routeVisibility={routeVisibility}
      post={null}
      loadPublicPost={routeState?.visibility === "public"}
      documentTitle={
        !routeState
          ? "Không tìm thấy bài viết"
          : routeVisibility === "privacy"
            ? "Bài viết riêng tư"
            : ""
      }
    />
  );
}
