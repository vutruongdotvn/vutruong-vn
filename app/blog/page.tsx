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

  // 🔥 NEW STATE
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const LIMIT = 3;

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const { user, role, loading: userLoading } = useUser();

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

    if (!error) setProfile(data);

    setProfileLoading(false);
  };

  // 🔥 LOAD POSTS (INFINITE)
  const loadPosts = async () => {
    if (!hasMore) return;

    setLoading(true);

    const from = page * LIMIT;
    const to = from + LIMIT - 1;

    const data = await getPosts(from, to);

    if (data.length < LIMIT) {
      setHasMore(false);
    }

    setPosts((prev) => {
  const newPosts = data.filter(
    (newPost) => !prev.some((p) => p.id === newPost.id)
  );

  return [...prev, ...newPosts];
});
    setPage((prev) => prev + 1);

    setLoading(false);
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  // 🔥 OBSERVER
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadPosts();
        }
      },
      { threshold: 1 }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [loadMoreRef, hasMore, page]);

  const fullName = user
    ? profile?.name || "Người dùng"
    : "Hello người lạ 👋";

  const email = user?.email || "";

  const avatar = user
    ? profile?.avatar || "/images/default.jpg"
    : "/images/default.jpg";

  const isReady = !userLoading && !profileLoading && posts.length > 0;

  return (
    <>
      <FancyboxWrapper />

      <div className="space-y-2 md:space-y-4">

        {!isReady && (
          <div className="space-y-2 md:space-y-4">
            <PostCardSkeleton />
            <PostCardSkeleton />
            <PostCardSkeleton />
          </div>
        )}

        {isReady && (
          <>
            {/* HEADER giữ nguyên */}
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
                  <p className="font-medium text-gray-800">
                    {fullName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user ? email : "Bạn chưa đăng nhập"}
                  </p>
                </div>
              </div>
            </div>

            {/* POSTS */}
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}

            {/* 🔥 SKELETON LOAD MORE */}
            {loading && (
              <>
                <PostCardSkeleton />
                <PostCardSkeleton />
                <PostCardSkeleton />
              </>
            )}

            {/* 🔥 TRIGGER LOAD */}
            <div ref={loadMoreRef}></div>

            {/* MODALS giữ nguyên */}
            {user && role === "admin" && (
              <CreatePostModal
                isOpen={open}
                onClose={() => {
                  setOpen(false);
                  location.reload();
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