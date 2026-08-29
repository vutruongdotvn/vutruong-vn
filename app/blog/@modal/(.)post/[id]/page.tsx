import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ModalFullPostV2 from "@/components/blog/modal/ModalFullPostV2";
import { getPostDetailData } from "@/lib/getPostDetailData";
import {
  getPostDocumentTitle,
  getPostMetadata,
} from "@/lib/getPostMetadata";

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

export default async function InterceptedPostPage({
  params,
}: InterceptedPostPageProps) {
  const { id } = await params;
  const detailData = await getPostDetailData(id);

  if (!detailData) notFound();

  return (
    <ModalFullPostV2
      postId={detailData.postId}
      documentTitle={getPostDocumentTitle(detailData)}
    />
  );
}
