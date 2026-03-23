"use client";

import Image from "next/image";
import PostCard from "@/components/blog/PostCard";
import CreatePostModal from "@/components/blog/CreatePostModal";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper";
import LoginModal from "@/components/auth/LoginModal";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";

import { useEffect, useState, useRef } from "react";
import { getPosts } from "@/services/postService";
import PostCardSkeleton from "@/components/blog/PostCardSkeleton";

export default function BlogPage() {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 NEW (KHÔNG ẢNH HƯỞNG LOGIC CŨ)
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const LIMIT = 3;

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const { user, role, loading: userLoading } = useUser();

  // ✅ FETCH PROFILE (GIỮ NGUYÊN)
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

  // 🔥 UPGRADE fetchPosts (KHÔNG ĐỔI CÁCH DÙNG)
  const fetchPosts = async () => {
    if (!hasMore) return;

    if (page === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const from = page * LIMIT;
    const to = from + LIMIT - 1;

    const data = await getPosts(from, to);

    if (data.length < LIMIT) {
      setHasMore(false);
    }

    setPosts((prev) => {
      if (page === 0) return data || [];

      const newPosts = data.filter(
        (newPost) => !prev.some((p) => p.id === newPost.id)
      );

      return [...prev, ...newPosts];
    });

    setPage((prev) => prev + 1);

    setLoading(false);
    setLoadingMore(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // 🔥 INFINITE SCROLL (CHỈ THÊM CÁI NÀY)
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          fetchPosts();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page]);

  const fullName = user
    ? profile?.name || "Người dùng"
    : "Hello người lạ 👋";

  const email = user?.email || "";

  const avatar = user
    ? profile?.avatar || "/images/default.jpg"
    : "/images/default.jpg";

  const isReady = !userLoading && !profileLoading && !loading;

  return (
    <>
      <FancyboxWrapper />

      <div className="space-y-2 md:space-y-4">

        {!isReady && (
          <div className="space-y-2 md:space-y-4">

            <div className="userWrap flex items-center justify-between gap-3 bg-white p-3 rounded-0 md:rounded-lg shadow-xs animate-pulse">
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

            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        )}

        {isReady && (
          <>
            <div className="userWrap flex items-center justify-between gap-3 bg-white p-3 rounded-0 md:rounded-lg shadow-xs">

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
                      <i className="fa-solid fa-badge-check text-blue-500 hover:text-blue-600 text-sm"></i>
                    )}
                  </p>
                  <p className="text-sm font-normal text-gray-500">
                    {user ? email : "Bạn chưa đăng nhập"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">

                {user && role === "admin" && (
                  <button
                    onClick={() => setOpen(true)}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                    title="Đăng bài"
                  >
                    <i className="fa-duotone fa-pen-to-square text-gray-600"></i>
                  </button>
                )}

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

            {user && role !== "admin" && (
              <p className="text-center text-gray-500 text-sm">
                Bạn chỉ có quyền xem bài viết 👀
              </p>
            )}

            {loading && (
              <div className="space-y-4">
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            )}

            {!loading && posts.length === 0 && (
              <p className="text-center text-gray-500">
                Chưa có bài viết nào 🧐
              </p>
            )}

            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* 🔥 LOAD MORE (1 SKE DUY NHẤT) */}
            {loadingMore && (
              <div className="flex justify-center py-4">
                <PostCardSkeleton />
              </div>
            )}

            {/* 🔥 TRIGGER */}
            <div ref={loadMoreRef}></div>

            {user && role === "admin" && (
              <CreatePostModal
                isOpen={open}
                onClose={() => {
                  setOpen(false);
                  fetchPosts(); // GIỮ NGUYÊN 100%
                }}
              />
            )}

            {showLogin && (
              <LoginModal onClose={() => setShowLogin(false)} />
            )}
          </>
        )}
      </div>
    </>
  );
}