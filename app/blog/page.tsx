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

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const { user, role, loading: userLoading } = useUser();

  // ✅ FETCH PROFILE
  const fetchProfile = async () => {
    if (!user) {
      setProfileLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("name, avatar")
      .eq("id", user.id)
      .single();

    if (!error) {
      setProfile(data);
    }

    setProfileLoading(false);
  };

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

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // ✅ chuẩn giống PostCard
  const fullName = user
    ? profile?.name || "Người dùng"
    : "Hello World ~";

  const email = user?.email || "";

  const avatar = user
    ? profile?.avatar || "/images/default.jpg"
    : "/images/default.jpg";

  // 🔥 READY STATE (CHỐNG FLASH)
  const isReady = !userLoading && !profileLoading && !loading;

  return (
    <>
      <FancyboxWrapper />

      <div className="space-y-4">

        {/* 🔄 SKELETON (HIỂN THỊ TRƯỚC) */}
        {!isReady && (
          <div className="space-y-4">

            {/* Header skeleton */}
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg shadow-sm animate-pulse">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div>
                  <div className="w-32 h-3 bg-gray-200 rounded mb-2" />
                  <div className="w-24 h-3 bg-gray-200 rounded" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-10 h-10 rounded-full bg-gray-200" />
                <div className="w-10 h-10 rounded-full bg-gray-200" />
              </div>
            </div>

            {/* Post skeleton */}
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        )}

        {/* ✅ UI THẬT (CHỈ RENDER KHI READY) */}
        {isReady && (
          <>
            {/* 🔝 HEADER */}
            <div className="flex items-center justify-between gap-3 bg-white p-3 rounded-lg shadow-sm">

              {/* 👤 USER INFO */}
              <div className="flex items-center gap-3">
                <Image
                  height={36}
                  width={36}
                  alt="avatar"
                  src={avatar}
                  className="w-10 h-10 rounded-full object-cover"
                />

                <div>
                  <p className="font-medium text-gray-800 flex items-center gap-1">
                    {fullName}
                    {user?.email === "admin@vutruong.vn" && (
                      <i className="fa-solid fa-badge-check text-blue-400 text-sm"></i>
                    )}
                  </p>
                  <p className="text-sm font-normal text-gray-500">
                    {user ? email : "Đăng nhập để viết bài"}
                  </p>
                </div>
              </div>

              {/* 👉 ACTION RIGHT */}
              <div className="flex items-center gap-2">

                {/* ✍️ CREATE POST */}
                {user && role === "admin" && (
                  <button
                    onClick={() => setOpen(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                    title="Đăng bài"
                  >
                    <i className="fa-duotone fa-pen-to-square text-gray-600"></i>
                  </button>
                )}

                {/* 🔐 LOGIN / LOGOUT */}
                {!user ? (
                  <button
                    onClick={() => setShowLogin(true)}
                    className="px-4 py-2 rounded-lg font-medium text-gray-600 text-sm bg-gray-100 hover:bg-gray-200 hover:text-black cursor-pointer transition"
                  >
                    Đăng nhập
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      await supabase.auth.signOut();
                      location.reload();
                    }}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                    title="Đăng xuất"
                  >
                    <i className="fa-duotone fa-arrow-right-from-bracket text-gray-600"></i>
                  </button>
                )}
              </div>
            </div>

            {/* ⛔ USER KHÔNG PHẢI ADMIN */}
            {user && role !== "admin" && (
              <p className="text-center text-gray-500 text-sm">
                Bạn chỉ có quyền xem bài viết 👀
              </p>
            )}

            {/* 🔄 LOADING POSTS (GIỮ NGUYÊN) */}
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

            {/* 🪟 CREATE POST MODAL */}
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
          </>
        )}
      </div>
    </>
  );
}