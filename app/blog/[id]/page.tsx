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

      <article className="fullPost rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md
              shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300
              hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
      <div className="actionFooter md:px-4 px-3 md:pt-4 pt-3">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black">
        <i className="fa-duotone fa-arrow-left text-xs"/>
        Quay lại
        </Link>
      </div>

        {/* HEADER */}
        <PostHeader
          name={name}
          avatar={avatar}
          createdAt={post.created_at}
          showMenu={false}
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