import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import {
  getPostRouteState,
  isValidPostId,
} from "@/lib/getPostRouteState";
import BlogDetailRealtime from "@/components/blog/BlogDetailRealtime";

// Không cache HTML của route chi tiết: nếu admin đổi một bài từ public sang
// privacy thì nội dung công khai cũ không được tiếp tục tồn tại trong cache.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Chặn ngay URL sai định dạng mà không cần gọi database.
  if (!id || !isValidPostId(id)) notFound();

  // Server chỉ biết chắc bài public. Bài privacy và ID không tồn tại được giữ
  // cùng một trạng thái để không làm lộ sự tồn tại của nội dung riêng tư.
  const routeState = await getPostRouteState(id);
  const routeVisibility = routeState?.visibility ?? "privacy";

  let post: any | null = null;

  // Chỉ fetch toàn bộ dữ liệu ở server khi đây là bài công khai.
  // Bài riêng tư tiếp tục được BlogDetailRealtime xác thực và fetch ở client
  // bằng JWT admin, nên server-only lookup không làm lộ nội dung riêng tư.
  if (routeVisibility === "public") {
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("visibility", "public")
      .maybeSingle();

    if (error) {
      throw new Error(
        `[BlogDetailPage] ${error.code || "QUERY_FAILED"}: ${error.message}`
      );
    }

    // Bài có thể vừa bị xóa giữa hai query; trong trường hợp đó trả 404.
    if (!data) notFound();

    post = data;
  }

  let profile: { name?: string | null; avatar?: string | null } | null = null;

  if (post) {
    const { data } = await supabase
      .from("profiles")
      .select("name, avatar")
      .eq("id", post.user_id)
      .maybeSingle();

    profile = data;
  }

  return (
    <BlogDetailRealtime
      postId={id}
      routeVisibility={routeVisibility}
      initialPost={post}
      initialProfile={profile}
    />
  );
}
