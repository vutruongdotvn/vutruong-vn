"use client";

import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import PostBody from "./PostBody";
import { useUser } from "@/hooks/useUser";
import {
  extractPostTitle,
  extractPostDescription,
} from "@/lib/postMeta";
import { getAvatarImage } from "@/lib/cloudinary";

export default function PostCard({
  post,
  isFirst = false,
  isLast = false,
  onPin,
  onDelete,
  onEdit,
}: any) {
  const name = post.profiles?.name;
  const avatar = getAvatarImage(post.profiles?.avatar);
  const { role } = useUser();

  return (
    <article className="post relative">

      {/* POST CONTENT */}
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
    </article>
  );
}