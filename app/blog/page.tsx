"use client";

import { useState } from "react";
import PostCard from "@/components/blog/PostCard";
import CreatePostModal from "@/components/blog/CreatePostModal";

export default function BlogPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">

      {/* CREATE POST */}
      <div className="bg-white p-4 rounded-2xl shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300" />

          <button
            onClick={() => setOpen(true)}
            className="flex-1 text-left bg-gray-100 hover:bg-gray-200 transition px-4 py-2 rounded-full text-sm text-gray-500"
          >
            Chào Vũ Trường, bạn đang nghĩ gì?
          </button>
        </div>
      </div>

      {/* POSTS */}
      <PostCard
        author="Vũ Trường"
        time="5 phút trước"
        content="Demo post 👀"
        images={["1", "2", "3", "4", "5"]}
      />
      {/* TEST POSTS */}
      <PostCard
        author="Vũ Trường"
        time="5 phút trước"
        content="1 ảnh nè 👀"
        images={["1"]}
      />

      <PostCard
        author="Vũ Trường"
        time="10 phút trước"
        content="3 ảnh test layout 🔥"
        images={["1", "2", "3"]}
      />

      <PostCard
        author="Vũ Trường"
        time="30 phút trước"
        content="Nhiều ảnh nè 😏"
        images={["1", "2", "3", "4", "5", "6"]}
      />
      
      {/* MODAL */}
      <CreatePostModal
        isOpen={open}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}