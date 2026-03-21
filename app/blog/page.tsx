"use client";

import Image from "next/image";
import { useState } from "react";
import PostCard from "@/components/blog/PostCard";
import CreatePostModal from "@/components/blog/CreatePostModal";
import { posts } from "@/lib/posts";

export default function BlogPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">

      {/* CREATE POST */}
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/avatar.JPEG" alt="logo" width={36} height={36} className="rounded-full pointer-events-none" />

          <button
            onClick={() => setOpen(true)}
            className="flex-1 text-left bg-gray-100 hover:bg-gray-200 transition px-4 py-2 rounded-full text-sm text-gray-600 cursor-pointer"
          >
            Hello ~
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
  );
}