import { notFound } from "next/navigation";
import ModalFullPostV2 from "@/components/blog/modal/ModalFullPostV2";
import { isValidPostId } from "@/lib/getPostRouteState";

type InterceptedPostPageProps = {
  params: Promise<{ id: string }>;
};

export default async function InterceptedPostPage({
  params,
}: InterceptedPostPageProps) {
  const { id } = await params;

  if (!isValidPostId(id)) notFound();

  return <ModalFullPostV2 postId={id} />;
}
