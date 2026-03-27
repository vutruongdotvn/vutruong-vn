"use client";
import Link from "next/link";
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
import { pinPost, deletePost } from "@/services/postService";
import { useToastContext } from "@/components/ui/ToastProvider";

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

  const LIMIT = 1;

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

  showToast("Đang xóa bài viết...", "warning", 0);

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
      },
      // { threshold: 0, rootMargin: "0px" }
    );

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page]);

  const fullName = user ? profile?.name || "Người dùng" : "Xin chào! 👋";

  const email = user?.email || "";

  const avatar = user
    ? profile?.avatar || "/images/default.jpg"
    : "/images/default.jpg";

  const isReady = !userLoading && !profileLoading && !loading;

  return (
    <>
      <FancyboxWrapper />

      <div className="space-y-1 md:space-y-4">
        {!isReady && (
          <div className="space-y-1 md:space-y-4">
            <div className="userWrap flex items-center justify-between gap-3 bg-white p-3 rounded-0 md:rounded-xl animate-pulse shadow-xs">
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
          </div>
        )}

        {isReady && (
          <>
            <div className="userWrap flex items-center justify-between gap-3 bg-white p-3 rounded-0 md:rounded-xl shadow-xs">
              <div className="flex items-center gap-2">
                <Link href="/profile">
                  <Image
                    height={40}
                    width={40}
                    alt="avatar"
                    src={avatar}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </Link>

                <div>
                  <p className="font-medium text-sm text-gray-800 flex items-center gap-[2px]">
                    {fullName}
                    {user && role === "admin" && (
                      <i className="fa-solid fa-badge-check text-blue-500 hover:text-blue-600 cursor-pointer text-xs" title="Tài khoản đã xác thực"></i>
                    )}
                  </p>
                  <p className="text-sm font-normal text-gray-500">
                    {user ? email : ""}{" "}
                    {/* thêm custom text vào giữa dấu ngoặc */}
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
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                    title="Đăng nhập"
                  >
                    <i className="fa-duotone fa-user-gear text-gray-600"></i>
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

            {/* 🔥 PINNED POST (HIỆN TRƯỚC) */}

            {/* 🔥 DANH SÁCH POSTS */}
            {posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onPin={handlePin}
                onDelete={handleDelete}
                onEdit={handleEdit}
              />
            ))}

            {/* 🔥 LOAD MORE (1 SKE DUY NHẤT) */}
            {loadingMore && (
              <div className="flex justify-center">
                <PostCardSkeleton />
              </div>
            )}

            {/* 🔥 TRIGGER */}
            <div ref={loadMoreRef}></div>

{/* 🔥 HẾT BÀI VIẾT */}
{!loading && posts.length > 0 && !hasMore && (
  <div className="text-center text-sm text-gray-400 mt-5">
    — Đã tải hết bài viết —
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
      </div>
    </>
  );
}
