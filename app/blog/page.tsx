"use client";

import Image from "next/image";
import PostCard from "@/components/blog/PostCard";
import CreatePostModal from "@/components/blog/CreatePostModal";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper";
import LoginModal from "@/components/auth/LoginModal";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";

import { useEffect, useState } from "react";
import { getPosts } from "@/services/postService";
import PostCardSkeleton from "@/components/blog/PostCardSkeleton";

export default function BlogPage() {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const { user, role } = useUser();

  // 🔥 fetch posts
  const fetchPosts = async () => {
    setLoading(true);
    const data = await getPosts();
    setPosts(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      <FancyboxWrapper />

      <div className="space-y-4">

        {/* 🔝 HEADER */}
        <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg shadow-sm">
          
          {/* 👤 USER INFO */}
          <div className="flex items-center gap-3">
            <Image
  height={36}
  width={36}
  alt="avatar"
  src={user?.user_metadata?.avatar_url || "/images/default.jpg"}
  className="w-10 h-10 rounded-full"
/>

            <div>
              <p className="font-semibold text-sm">
                {/* {user?.email || "Chưa đăng nhập"} */}
                {user?.user_metadata?.full_name || user?.email}
              </p>
              <p className="text-sm font-medium text-gray-500">
                {role === "admin"
                  ? "Admin"
                  : role === "user"
                  ? "User"
                  : "Đăng nhập để viết bài"}
              </p>
            </div>
          </div>

        {/* ✍️ CREATE POST (CHỈ ADMIN) */}
        {user && role === "admin" && (
          <button
                onClick={() => setOpen(true)}
                className="flex-1 bg-0 px-4 py-2 rounded-lg font-medium text-gray-600 text-sm bg-gray-100 flex-fill hover:bg-gray-200 hover:text-black cursor-pointer transition"
              >
                Đăng bài viết
              </button>
        )}

          {/* 🔐 LOGIN / LOGOUT */}
          {!user ? (
            <button
              onClick={() => setShowLogin(true)}
              className="bg-0 px-4 py-2 rounded-lg font-medium text-gray-600 text-sm bg-gray-100 flex-fill hover:bg-gray-200 hover:text-black cursor-pointer transition"
            >
              Đăng nhập
            </button>
          ) : (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                location.reload();
              }}
              className="bg-0 px-4 py-2 rounded-lg font-medium text-gray-600 text-sm bg-gray-100 flex-fill hover:bg-gray-200 hover:text-black cursor-pointer transition"
            >
              Đăng xuất
            </button>
          )}
        </div>

        {/* ⛔ USER KHÔNG PHẢI ADMIN */}
        {user && role !== "admin" && (
          <p className="text-center text-gray-500 text-sm">
            Bạn chỉ có quyền xem bài viết 👀
          </p>
        )}

        {/* ⛔ CHƯA LOGIN */}
        {!user && (
          <p className="text-center text-gray-500 text-sm hidden">
            Bạn chưa đăng nhập, chỉ có thể xem bài viết thôi.
          </p>
        )}

        {/* 🔄 LOADING */}
        {loading && (
          <div className="space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        )}

        {/* 📭 EMPTY */}
        {!loading && posts.length === 0 && (
          <p className="text-center text-gray-500">
            Chưa có bài viết nào 🧐
          </p>
        )}

        {/* 📰 POSTS */}
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}

        {/* 🪟 CREATE POST MODAL (CHỈ ADMIN) */}
        {user && role === "admin" && (
          <CreatePostModal
            isOpen={open}
            onClose={() => {
              setOpen(false);
              fetchPosts();
            }}
          />
        )}

        {/* 🔐 LOGIN MODAL */}
        {showLogin && (
          <LoginModal onClose={() => setShowLogin(false)} />
        )}
      </div>
    </>
  );
}