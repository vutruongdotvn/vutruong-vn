import Image from "next/image";
import { posts } from "@/lib/posts";
import { notFound } from "next/navigation";
import PostImages from "@/components/blog/PostImages";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const post = posts.find((p) => p.id === id);

  if (!post) return notFound();

  return (
    <>
      {/* Fancybox global (bắt image trong page này luôn) */}
      <FancyboxWrapper />

      <article className="bg-white rounded-2xl shadow-sm p-5 space-y-4">
        {/* HEADER */}
        <div className="flex items-center gap-3">
          <Image
            src="/avatar.JPEG"
            alt="avatar"
            width={45}
            height={45}
            className="rounded-full"
          />

          <div>
            <p className="font-semibold text-gray-900">{post.author}</p>
            <p className="text-sm text-gray-500">{post.time}</p>
          </div>
        </div>

        {/* CONTENT */}
        <p className="text-gray-800 leading-relaxed">
          {post.content}
        </p>

        {/* IMAGES */}
        <PostImages
          images={post.images}
          postId={post.id} // ✅ FIX QUAN TRỌNG
        />
      </article>
    </>
  );
}