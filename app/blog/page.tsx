"use client";

import PostCard from "@/components/blog/PostCard";
import CreatePostModal from "@/components/blog/CreatePostModal";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper";
import LoginModal from "@/components/auth/LoginModal";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { useEffect, useState, useRef } from "react";
import { getPosts } from "@/services/postService";
import SmartPostSkeletonFeed from "@/components/blog/SmartPostSkeletonFeed";
import { pinPost, deletePost } from "@/services/postService";
import { useToastContext } from "@/components/ui/ToastProvider";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";
import BlogUserCard from "@/components/blog/BlogUserCard";

export default function BlogPage() {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  // 🔥 NEW (KHÔNG ẢNH HƯỞNG LOGIC CŨ)
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const LIMIT = 3;

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const { user, role, loading: userLoading } = useUser();
  const { showToast } = useToastContext();

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

  const handlePin = async (post: any) => {
    const res = await pinPost(post.id, post.is_pinned);

    if (!res.success) {
      alert(res.error);
      return;
    }

    window.location.reload(); // 🔥 FIX
  };

  const handleDelete = async (post: any) => {
    if (!confirm("Xác nhận xóa bài viết này?")) return;

    showToast("Đang xóa bài viết", "warning", 0);

    const res = await deletePost(post.id, post.public_ids);

    if (!res.success) {
      showToast(res.error || "Xóa bài viết thất bại!", "error", 3200);
      return;
    }

    console.log("🔥 DELETE RESULT:", res);
    window.location.reload();
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setOpen(true);
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
      }
      // { threshold: 0, rootMargin: "0px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page]);

  const fullName = user ? profile?.name || "Người dùng" : "Xin chào! 👋";

  const email = user?.email || "";

  const avatar = user
    ? optimizeCloudinaryImage(profile?.avatar, {
        width: 80,
        height: 80,
        quality: 80,
        crop: "fill",
      }) || "/images/default.jpg"
    : "/images/default.jpg";

  const isReady = !userLoading && !profileLoading && !loading;

  return (
    <>
      <FancyboxWrapper />

      {!isReady && (
  <div className="space-y-4 md:space-y-4">
    <div className="userWrap flex items-center justify-between gap-3 bg-white/80 backdrop-blur-md border border-white/70 p-4 rounded-2xl animate-pulse shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
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

    <SmartPostSkeletonFeed mode="initial" />
  </div>
)}

      {isReady && (
        <>
          <BlogUserCard
  user={user}
  role={role}
  fullName={fullName}
  email={email}
  avatar={avatar}
  className="mb-8"
  onOpenCreatePost={() => setOpen(true)}
  onOpenLogin={() => setShowLogin(true)}
/>

          {user && role !== "admin" && (
            <p className="text-center text-gray-500 text-sm">
              Bạn chỉ có quyền xem bài viết 👀
            </p>
          )}

          {loading && <SmartPostSkeletonFeed mode="initial" />}

          {!loading && posts.length === 0 && (
            <p className="text-center text-gray-500">Chưa có bài viết nào 🧐</p>
          )}

          {/* 🔥 PINNED POST (HIỆN TRƯỚC) */}

          {/* 🔥 DANH SÁCH POSTS */}
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              isFirst={index === 0}
              isLast={index === posts.length - 1}
              onPin={handlePin}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}

          {/* 🔥 LOAD MORE (1 SKE DUY NHẤT) */}
          {loadingMore && <SmartPostSkeletonFeed mode="loadMore" />}

          {/* 🔥 TRIGGER */}
          <div ref={loadMoreRef}></div>

          {/* 🔥 HẾT BÀI VIẾT */}
          {!loading && posts.length > 0 && !hasMore && (
            <div className="text-center text-sm text-gray-400 mt-5">
              Hết!
            </div>
          )}

          {user && role === "admin" && (
            <CreatePostModal
              isOpen={open}
              editingPost={editingPost}
              onClose={() => {
                setOpen(false);
                setEditingPost(null);
                // window.location.reload();
              }}
            />
          )}

          {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        </>
      )}
    </>
  );
}
