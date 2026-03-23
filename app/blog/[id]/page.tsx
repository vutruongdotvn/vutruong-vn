import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PostImages from "@/components/blog/PostImages";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper";
import PostHeader from "@/components/blog/PostHeader";

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

      <article className="bg-white rounded-lg shadow-sm p-5 space-y-4">
        
        {/* HEADER */}
        <PostHeader
          name={name}
          avatar={avatar}
          createdAt={post.created_at}
          showMenu={true}
        />


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