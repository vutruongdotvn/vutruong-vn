"use client";

import Image from "next/image";
import Link from "next/link";
import PostImages from "./PostImages";
import { formatTimeAgo } from "@/lib/utils";
import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import PostBody from "./PostBody";
import { useUser } from "@/hooks/useUser";
import {
  extractPostTitle,
  extractPostDescription,
} from "@/lib/postMeta";

type Post = {
  id: string;
  content: string;
  images: string[];
  created_at: string;
  profiles?: {
    name: string;
    avatar: string;
  };
};

// 🔥 THÊM isFirst (optional)
export default function PostCard({
  post,
  isFirst = false,
  onPin,
  onDelete,
  onEdit,
}: any) {
  const name = post.profiles?.name;
  const avatar = post.profiles?.avatar;
  const { role } = useUser();

  return (
    <div
    className={`postCard bg-white md:rounded-xl rounded-0 shadow-xs border border-white/70
        ${post.is_pinned ? "pinnedPost" : ""}
  `}
    >
      <div className="postHeader block">
        <PostHeader
          name={name}
          avatar={avatar}
          createdAt={post.created_at}
          postId={post.id}
          showMenu={role === "admin"} // 🔥 FIX ADMIN
          isPinned={post.is_pinned} // 🔥 truyền trạng thái
          onPin={() => onPin(post)}
          onEdit={() => onEdit(post)}
          onDelete={() => onDelete(post)}
        />
      </div>

      <PostBody
        content={post.content}
        images={post.images}
        postId={post.id}
        truncate={true}
        priority={isFirst} // 🔥 truyền xuống
      />

      <PostActions
                postId={post.id}
                postTitle={extractPostTitle(post.content)}
                postDescription={extractPostDescription(post.content)}
              />
    </div>
  );
}
