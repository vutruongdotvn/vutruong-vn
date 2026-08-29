import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModalFullPostV2, {
  type ModalFullPostData,
} from "@/components/blog/modal/ModalFullPostV2";
import {
  getPostDetailData,
  type PostDetailData,
} from "@/lib/getPostDetailData";
import {
  getPostDocumentTitle,
  getPostMetadata,
} from "@/lib/getPostMetadata";
import { isValidPostId } from "@/lib/getPostRouteState";

type InterceptedPostPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: InterceptedPostPageProps): Promise<Metadata> {
  const { id } = await params;
  return getPostMetadata(id);
}

function getOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getPostImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (image): image is string =>
        typeof image === "string" && image.trim().length > 0
    )
    .map((image) => image.trim());
}

function createModalPostData(
  detailData: PostDetailData
): ModalFullPostData | null {
  const post = detailData.initialPost;
  if (!post) return null;

  const createdAt = getOptionalString(post.created_at);

  if (!createdAt) {
    throw new Error(
      `[InterceptedPostPage] Missing created_at for post ${detailData.postId}`
    );
  }

  return {
    id: post.id,
    content: typeof post.content === "string" ? post.content : "",
    images: getPostImages(post.images),
    createdAt,
    author: {
      name:
        getOptionalString(detailData.initialProfile?.name) ||
        getOptionalString(post.author_name) ||
        "Người dùng",
      avatar:
        getOptionalString(detailData.initialProfile?.avatar) ||
        getOptionalString(post.author_avatar),
    },
  };
}

export default async function InterceptedPostPage({
  params,
}: InterceptedPostPageProps) {
  const { id } = await params;

  // URL sai định dạng vẫn là một route 404 thật. Trường hợp bài hợp lệ vừa bị
  // xóa hoặc đổi visibility sẽ được xử lý bằng fallback bên trong modal để
  // không thay thế trang nền của Parallel Route bằng giao diện 404.
  if (!isValidPostId(id)) notFound();

  const detailData = await getPostDetailData(id);

  if (!detailData) {
    return (
      <ModalFullPostV2
        postId={id}
        routeVisibility="public"
        post={null}
        documentTitle="Không tìm thấy bài viết"
      />
    );
  }

  return (
    <ModalFullPostV2
      postId={detailData.postId}
      routeVisibility={detailData.routeVisibility}
      post={createModalPostData(detailData)}
      documentTitle={getPostDocumentTitle(detailData)}
    />
  );
}
