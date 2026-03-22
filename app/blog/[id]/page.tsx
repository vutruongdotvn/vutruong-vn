import { notFound } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import PostImages from "@/components/blog/PostImages";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return notFound();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!post) return notFound();

  // 🔥 LẤY PROFILE THEO user_id
  const { data: profile } = await supabase
    .from("profiles")
    .select("name, avatar")
    .eq("id", post.user_id)
    .maybeSingle();

  // 🔥 fallback
  const name = profile?.name || post.author_name || "Người dùng";
  const avatar =
    profile?.avatar || post.author_avatar || "/images/default.jpg";

  return (
    <>
      <FancyboxWrapper />

      <article className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Image
            src={avatar}
            alt="avatar"
            width={45}
            height={45}
            className="rounded-full object-cover"
          />

          <div>
            <p className="font-semibold text-gray-900">
              {name}
            </p>
            <p className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleString()}
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <p className="text-gray-800 whitespace-pre-line">
          {post.content}
        </p>

        {/* IMAGES */}
        {post.images?.length > 0 && (
          <PostImages images={post.images} postId={post.id} />
        )}
      </article>
    </>
  );
}