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
    <article className="post relative border-b border-slate-200 last:border-b-0">

      {/* POST CONTENT */}
      <div
        className={`postCard
        ${post.is_pinned ? "pinnedPost" : ""}
        `}>
        <PostHeader
          name={name}
          avatar={avatar}
          createdAt={post.created_at}
          postId={post.id}
          showMenu={role === "admin"}
          isPinned={post.is_pinned}
          isAdmin={role === "admin"} // 🔥 QUAN TRỌNG
          onPin={() => onPin(post)}
          onEdit={() => onEdit(post)}
          onDelete={() => onDelete(post)}
          hideAvatar
          visibility={post.visibility}
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