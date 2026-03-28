"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";

import PostCard from "@/components/blog/PostCard";
import PostCardSkeleton from "@/components/blog/PostCardSkeleton";
import CreatePostModal from "@/components/blog/CreatePostModal";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper";
import LoginModal from "@/components/auth/LoginModal";
import BlogUserCard from "@/components/blog/BlogUserCard";

import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";
import { useToastContext } from "@/components/ui/ToastProvider";

import {
  getPostsByHashtag,
  countPostsByHashtag,
  pinPost,
  deletePost,
} from "@/services/postService";

export default function BlogTagPage() {
  const params = useParams();
  const rawTag = Array.isArray(params?.tag) ? params.tag[0] : params?.tag || "";
  const tagName = decodeURIComponent(rawTag).trim().toLowerCase();

  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any | null>(null);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalPosts, setTotalPosts] = useState(0);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const LIMIT = 3;

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const { user, role, loading: userLoading } = useUser();
  const { showToast } = useToastContext();

  const displayTag = useMemo(() => {
    return tagName.startsWith("#") ? tagName : `#${tagName}`;
    }, [tagName]);

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

    window.location.reload();
  };

  const handleDelete = async (post: any) => {
    if (!confirm("Xác nhận xóa bài viết này?")) return;

    showToast("Đang xóa bài viết", "warning", 0);

    const res = await deletePost(post.id, post.public_ids);

    if (!res.success) {
      showToast(res.error || "Xóa bài viết thất bại!", "error", 3200);
      return;
    }

    window.location.reload();
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setOpen(true);
  };

  const fetchPosts = async () => {
    if (!hasMore || !tagName) return;

    if (page === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    const from = page * LIMIT;
    const to = from + LIMIT - 1;

    const data = await getPostsByHashtag(tagName, from, to);

    if (data.length < LIMIT) {
      setHasMore(false);
    }

    setPosts((prev) => {
      if (page === 0) return data || [];

      const newPosts = data.filter(
        (newPost: any) => !prev.some((p) => p.id === newPost.id)
      );

      return [...prev, ...newPosts];
    });

    setPage((prev) => prev + 1);
    setLoading(false);
    setLoadingMore(false);
  };

  const fetchTotalPosts = async () => {
    if (!tagName) return;
    const total = await countPostsByHashtag(tagName);
    setTotalPosts(total);
  };

  useEffect(() => {
    if (!tagName) return;

    setPosts([]);
    setPage(0);
    setHasMore(true);
    setLoading(true);

    fetchTotalPosts();

    (async () => {
      const firstBatch = await getPostsByHashtag(tagName, 0, LIMIT - 1);

      if (firstBatch.length < LIMIT) {
        setHasMore(false);
      }

      setPosts(firstBatch || []);
      setPage(1);
      setLoading(false);
    })();
  }, [tagName]);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  useEffect(() => {
    if (!loadMoreRef.current) return;
    if (loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchPosts();
      }
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, loading, tagName]);

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

          <div className="rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md p-4 animate-pulse">
            <div className="w-56 h-4 bg-gray-200 rounded mb-3" />
            <div className="w-32 h-3 bg-gray-100 rounded" />
          </div>

          <PostCardSkeleton />
          <PostCardSkeleton />
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
  className="mb-5"
  onOpenCreatePost={() => setOpen(true)}
  onOpenLogin={() => setShowLogin(true)}
/>

          {/* BOX THÔNG BÁO HASHTAG */}
          <div className="mb-7 rounded-2xl border border-white/70 bg-white/80 backdrop-blur-md px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-sm text-gray-500 mb-1">Bộ lọc hashtag</p>
                <h1 className="text-base sm:text-lg font-semibold text-gray-900">
                  Các bài viết có hashtag{" "}
                  <span className="text-gray-800">{displayTag}</span>
                </h1>
              </div>

              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black transition"
              >
                <i className="fa-duotone fa-arrow-left" />
                Quay lại Blog
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-2">
              {totalPosts > 0
                ? `${totalPosts} bài viết được tìm thấy`
                : `Chưa tìm thấy bài viết nào với hashtag ${displayTag}`}
            </p>
          </div>

          {user && role !== "admin" && (
            <p className="text-center text-gray-500 text-sm">
              Bạn chỉ có quyền xem bài viết 👀
            </p>
          )}

          {loading && (
            <div className="space-y-0">
              <PostCardSkeleton />
              <PostCardSkeleton />
              <PostCardSkeleton />
            </div>
          )}

          {!loading && posts.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Chưa có bài viết nào với hashtag <span className="font-medium">{displayTag}</span> 🧐
            </div>
          )}

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

          {loadingMore && (
            <div className="w-full">
              <PostCardSkeleton />
            </div>
          )}

          <div ref={loadMoreRef}></div>

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
              }}
            />
          )}

          {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
        </>
      )}
    </>
  );
}