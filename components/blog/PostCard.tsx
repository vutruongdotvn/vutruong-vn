"use client";

import Image from "next/image";
import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import PostBody from "./PostBody";
import { useUser } from "@/hooks/useUser";
import {
  extractPostTitle,
  extractPostDescription,
} from "@/lib/postMeta";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";

export default function PostCard({
  post,
  isFirst = false,
  isLast = false,
  onPin,
  onDelete,
  onEdit,
}: any) {
  const name = post.profiles?.name;
  const avatar = optimizeCloudinaryImage(post.profiles?.avatar, {
    width: 80,
    height: 80,
    quality: 80,
    crop: "fill",
  });

  const { role } = useUser();

  return (
    <article className="timelineItem relative">
      <div className="grid md:grid-cols-[40px_1fr] grid-cols-[33px_1fr] gap-2 md:gap-3">
        {/* LEFT TIMELINE */}
        <div className="relative flex flex-col items-center">
          {/* Avatar */}
          <div className="relative z-20 mt-2">
            <Image
              src={avatar || "/images/default.jpg"}
              alt={name || "avatar"}
              width={40}
              height={40}
              className="w-full h-full rounded-full object-cover shadow-sm bg-white"
            />
          </div>

          {/* Line */}
          <div className="absolute mt-3 top-15 bottom-[-10px] w-[2px] bg-gradient-to-b from-gray-200 via-gray-200 to-gray-200 z-0" />

          {/* Dot */}
          <div
            className={`relative z-10 mt-3 size-3 rounded-full border-2 border-white shadow-sm ${
              post.is_pinned ? "bg-neutral-400" : "bg-gray-300"
            }`}
          />
        </div>

        {/* RIGHT CONTENT */}
        <div className="p-0">
          <div
            className={`
              rounded-2xl bg-white/80 backdrop-blur-md
              shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300
              hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]
              ${post.is_pinned ? "pinnedPost" : ""}
            `}
          >
            <PostHeader
              name={name}
              avatar={avatar}
              createdAt={post.created_at}
              postId={post.id}
              showMenu={role === "admin"}
              isPinned={post.is_pinned}
              onPin={() => onPin(post)}
              onEdit={() => onEdit(post)}
              onDelete={() => onDelete(post)}
              hideAvatar
            />

            <PostBody
              content={post.content}
              images={post.images}
              postId={post.id}
              truncate={true}
              priority={isFirst}
            />

            <PostActions
              postId={post.id}
              postTitle={extractPostTitle(post.content)}
              postDescription={extractPostDescription(post.content)}
            />
          </div>
        </div>
      </div>
    </article>
  );
}