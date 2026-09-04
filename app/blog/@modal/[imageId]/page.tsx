import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModalFullPostV2 from "@/components/blog/modal/ModalFullPostV2";
import { getPostMetadata } from "@/lib/getPostMetadata";
import { isValidPostImageId } from "@/lib/postImageRoute";
import { getPostRouteState, isValidPostId } from "@/lib/getPostRouteState";

type InterceptedPostImagePageProps = {
  params: Promise<{ id: string; imageId: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: InterceptedPostImagePageProps): Promise<Metadata> {
  const { id, imageId } = await params;

  if (!isValidPostId(id) || !isValidPostImageId(imageId)) {
    return {
      title: "Không tìm thấy bài viết",
      robots: { index: false, follow: false },
    };
  }

  const routeState = await getPostRouteState(id);

  if (routeState?.visibility !== "public") return getPostMetadata(id);

  return {
    title: "Bài viết",
    description: "Xem bài viết này trên VT Zone",
    alternates: { canonical: `https://www.vutruong.vn/blog/post/${id}` },
    robots: { index: true, follow: true },
  };
}

export default async function InterceptedPostImagePage({
  params,
}: InterceptedPostImagePageProps) {
  const { id, imageId } = await params;

  if (!isValidPostId(id) || !isValidPostImageId(imageId)) notFound();

  const routeState = await getPostRouteState(id);
  const routeVisibility = routeState?.visibility ?? "privacy";

  return (
    <ModalFullPostV2
      key={`${id}:${imageId}:${routeVisibility}`}
      postId={id}
      initialImageId={imageId}
      routeVisibility={routeVisibility}
      post={null}
      loadPublicPost={routeState?.visibility === "public"}
      documentTitle={!routeState ? "Bài viết" : ""}
    />
  );
}
