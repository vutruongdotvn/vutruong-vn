"use client";

import Image from "next/image";
import { useState } from "react";
import PostCard from "@/components/blog/PostCard";
import CreatePostModal from "@/components/blog/CreatePostModal";
import { posts } from "@/lib/posts";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper";

export default function BlogPage() {
  const [open, setOpen] = useState(false);

  return (
    <>
    <FancyboxWrapper />
    <div className="space-y-4">

      {/* CREATE POST */}
      <div className="bg-white p-4 lg:rounded-lg rounded-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/avatar.JPEG" alt="logo" width={40} height={40} className="rounded-full pointer-events-none w-10 h-10" />

          <button
            onClick={() => setOpen(true)}
            className="flex-1 text-left bg-gray-100 hover:bg-gray-200 transition px-4 py-2 rounded-full text-base text-gray-500 cursor-pointer"
          >
            Đăng bài viết
          </button>

          <button onClick={() => setOpen(true)} className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-2 rounded-full w-10 h-10 transition">
            <i className="fa-duotone fa-paper-plane-top"/>
          </button>
        </div>
      </div>

      {/* POSTS */}
      {posts.map((post) => (
        <PostCard key={post.id} {...post} />
      ))}

      {/* MODAL */}
      <CreatePostModal
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </div>
    </>
  );
}