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
        <div className="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm hidden">
          
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

          {/* 🔐 LOGIN / LOGOUT */}
          {!user ? (
            <button
              onClick={() => setShowLogin(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
            >
              Đăng nhập
            </button>
          ) : (
            <button
              onClick={async () => {
                await supabase.auth.signOut();
                location.reload();
              }}
              className="bg-0 px-4 py-2 rounded-lg font-medium text-gray-600 text-sm hover:bg-gray-200 hover:text-black cursor-pointer transition"
            >
              Đăng xuất
            </button>
          )}
        </div>

        {/* ✍️ CREATE POST (CHỈ ADMIN) */}
        {user && role === "admin" && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center gap-3">
              <Image
                src="/avatar.JPEG"
                alt="avatar"
                width={40}
                height={40}
                className="rounded-full w-10 h-10"
              />

              <button
                onClick={() => setOpen(true)}
                className="flex-1 text-left bg-gray-100 hover:bg-gray-200 transition px-4 py-2 rounded-full text-base text-gray-500 cursor-pointer"
              >
                Đăng bài viết...
              </button>

              <button
                onClick={() => setOpen(true)}
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 p-2 rounded-full w-10 h-10 transition"
              >
                <i className="fa-duotone fa-paper-plane-top" />
              </button>
            </div>
          </div>
        )}

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
          <p className="text-center text-gray-500 hidden">Đang tải...</p>
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