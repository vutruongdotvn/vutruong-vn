"use client";

import Image from "next/image";
import Link from "next/link";
import PostImages from "./PostImages";
import { formatTimeAgo } from "@/lib/utils";
import PostHeader from "./PostHeader";
import PostActions from "./PostActions";
import PostBody from "./PostBody";

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
  return (
    <div className="postCard bg-white lg:rounded-lg rounded-0 shadow-xs md:shadow-sm hover:shadow-md transition">
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

        <PostBody
          content={post.content}
          images={post.images}
          postId={post.id}
          truncate={true}
        />
        <PostActions />
    </div>
  );
}