import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
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

  if (!id) notFound();

  // Client Supabase dùng ở server không mang theo session đang lưu trong
  // trình duyệt. Vì vậy server chỉ được phép lấy bài công khai.
  // Nếu đây là bài riêng tư, BlogDetailRealtime sẽ xác thực admin ở client
  // rồi mới thực hiện truy vấn bằng access token của người đang đăng nhập.
  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .eq("visibility", "public")
    .maybeSingle();

  if (postError) {
    console.error("[BlogDetailPage] public post query failed:", {
      code: postError.code,
      message: postError.message,
      details: postError.details,
      hint: postError.hint,
    });
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
      initialPost={post}
      initialProfile={profile}
    />
  );
}
