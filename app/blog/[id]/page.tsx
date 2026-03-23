import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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

      <article className="bg-white rounded-lg shadow-sm p-5 space-y-4">
        
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Image
            src={avatar || "/avatar.JPEG"}
            alt="avatar"
            width={40}
            height={40}
            className="rounded-full object-cover"
            priority
          />

          <div className="leading-5">
            <Link className="flex items-center gap-1" href={`/bio`}>
              <span className="font-medium text-gray-800 hover:text-black text-base">
                {name || "Người dùng"}
              </span>
              <i className="fa-solid fa-badge-check text-blue-400 text-sm" />
            </Link>

            <div className="block group">
              <span className="block text-sm text-gray-500 hover:text-gray-800 font-normal">
              {new Date(post.created_at).toLocaleString()}
              </span>
            </div>
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