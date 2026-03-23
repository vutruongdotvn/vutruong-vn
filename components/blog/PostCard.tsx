"use client";

import Image from "next/image";
import Link from "next/link";
import PostImages from "./PostImages";
import { formatTimeAgo } from "@/lib/utils";
import PostHeader from "./PostHeader";

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

export default function PostCard({ post }: { post: Post }) {
  const name = post.profiles?.name;
  const avatar = post.profiles?.avatar;

  // 🔥 LIMIT CONTENT
  const MAX_LENGTH = 200;
  const isLong = post.content.length > MAX_LENGTH;
  const shortContent = isLong
    ? post.content.slice(0, MAX_LENGTH) + "..."
    : post.content;

  return (
    <div className="bg-white lg:rounded-lg rounded-0 shadow-sm p-4 hover:shadow-md transition">
      <div className="postHeader block">
        <PostHeader
          name={name}
          avatar={avatar}
          createdAt={post.created_at}
          postId={post.id}
          showLink={true}
          showMenu={true}
          timeFormat={formatTimeAgo}
        />
      </div>

      {/* 🔥 CONTENT (ĐÃ FIX) */}
      <div className="mt-3 text-gray-800 leading-relaxed whitespace-pre-line">
        {shortContent}

        {isLong && (
          <Link
            title="Xem chi tiết"
            href={`/blog/${post.id}`}
            className="text-gray-800 font-semibold hover:text-black"
          >
            Xem thêm
          </Link>
        )}
      </div>

      <PostImages images={post.images || []} postId={post.id} />
    </div>
  );
}