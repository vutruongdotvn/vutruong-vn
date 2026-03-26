import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import PostImages from "@/components/blog/PostImages";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper";
import PostHeader from "@/components/blog/PostHeader";
import PostActions from "@/components/blog/PostActions";
import PostBody from "@/components/blog/PostBody";
import {
  extractPostTitle,
  extractPostDescription,
} from "@/lib/postMeta";

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
      <div className="actionFooter mb-3 text-center sm:text-start">
        <Link href="/blog" className="flex md:inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black
        bg-0 sm:bg-white px-4 py-2 rounded-0 sm:rounded-md md:shadow-xs">
        <i className="fa-duotone fa-arrow-left text-xs"/>
        Quay lại
        </Link>
      </div>

      <article className="fullPost bg-white rounded-0 md:rounded-xl shadow-xs m-0 p-0">
        
        {/* HEADER */}
        <PostHeader
          name={name}
          avatar={avatar}
          createdAt={post.created_at}
          showMenu={true}
        />

        <PostBody
          content={post.content}
          images={post.images}
          postId={post.id}
        />
        <PostActions
          postId={post.id}
          postTitle={extractPostTitle(post.content)}
          postDescription={extractPostDescription(post.content)}
        />
      </article>
    </>
  );
}