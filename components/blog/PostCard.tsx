"use client";

import Image from "next/image";
import Link from "next/link";
import PostImages from "./PostImages";
import { formatTimeAgo } from "@/lib/utils";

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image
            src={avatar || "/avatar.JPEG"}
            alt="avatar"
            width={40}
            height={40}
            className="rounded-full object-cover"
            unoptimized
          />

          <div className="leading-6">
            <Link href={`/bio`}>
              <span className="font-semibold text-gray-900">
                {name || "Người dùng"}
              </span>
            </Link>

            <Link href={`/blog/${post.id}`} className="block group">
              <span className="block text-sm text-gray-500 hover:text-gray-800 font-normal">
                {formatTimeAgo(post.created_at)}
              </span>
            </Link>
          </div>
        </div>

        <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <i className="fa-duotone fa-ellipsis"></i>
        </button>
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