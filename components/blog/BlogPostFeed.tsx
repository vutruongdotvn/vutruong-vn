"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "@/components/blog/PostCard";
import SmartPostSkeletonFeed from "@/components/blog/SmartPostSkeletonFeed";
import CreatePostModal from "@/components/blog/CreatePostModal";
import { getPosts, pinPost, deletePost } from "@/services/postService";
import { useToastContext } from "@/components/ui/ToastProvider";
import { useUser } from "@/hooks/useUser";

export default function BlogPostFeed() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  // ✅ Chống request chồng nhau / stale closure
  const isFetchingRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const mountedRef = useRef(true);

  const LIMIT = 3;

  const { user, role } = useUser();
  const { showToast, removeToast } = useToastContext();

  const sortPostsByPinnedAndDate = (posts: any[]) => {
    return [...posts].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  };

  const mergeNewPostToTop = (prevPosts: any[], newPost: any) => {
    const filtered = prevPosts.filter((p) => p.id !== newPost.id);
    const merged = [newPost, ...filtered];
    return sortPostsByPinnedAndDate(merged);
  };

  const handlePin = async (post: any) => {
    const pinningToastId = showToast(
      post.is_pinned ? "Đang bỏ ghim bài viết" : "Đang ghim bài viết",
      "warning",
      0
    );

    const res = await pinPost(post.id, post.is_pinned);

    if (!res.success) {
      removeToast(pinningToastId);
      showToast(res.error || "Cập nhật ghim bài viết thất bại!", "error", 3200);
      return;
    }

    setPosts((prev) => {
      let updatedPosts;

      if (post.is_pinned) {
        updatedPosts = prev.map((p) =>
          p.id === post.id ? { ...p, is_pinned: false } : p
        );
      } else {
        updatedPosts = prev.map((p) => ({
          ...p,
          is_pinned: p.id === post.id,
        }));
      }

      return sortPostsByPinnedAndDate(updatedPosts);
    });

    removeToast(pinningToastId);
    showToast(
      post.is_pinned ? "Đã bỏ ghim bài viết" : "Đã ghim bài viết",
      "success",
      2200
    );
  };

  const handleDelete = async (post: any) => {
    if (!confirm("Xác nhận xóa bài viết này?")) return;

    const deletingToastId = showToast("Đang xóa bài viết", "warning", 0);

    const res = await deletePost(post.id, post.public_ids);

    if (!res.success) {
      removeToast(deletingToastId);
      showToast(res.error || "Xóa bài viết thất bại!", "error", 3200);
      return;
    }

    setPosts((prev) => prev.filter((p) => p.id !== post.id));
    removeToast(deletingToastId);
    showToast("Đã xóa bài viết", "success", 2200);
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setOpen(true);
  };

  const handleEditSuccess = (updatedPost: any) => {
    setPosts((prev) =>
      sortPostsByPinnedAndDate(
        prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
      )
    );
  };

  const fetchPosts = useCallback(async () => {
    if (isFetchingRef.current) return;
    if (!hasMoreRef.current) return;

    isFetchingRef.current = true;

    const currentPage = pageRef.current;
    const from = currentPage * LIMIT;
    const to = from + LIMIT - 1;

    if (currentPage === 0) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const data = await getPosts(from, to);

      if (!mountedRef.current) return;

      const safeData = Array.isArray(data) ? data : [];

      if (safeData.length < LIMIT) {
        setHasMore(false);
        hasMoreRef.current = false;
      }

      setPosts((prev) => {
        if (currentPage === 0) {
          return safeData;
        }

        const newPosts = safeData.filter(
          (newPost) => !prev.some((p) => p.id === newPost.id)
        );

        return [...prev, ...newPosts];
      });

      pageRef.current = currentPage + 1;
      setPage(currentPage + 1);
    } catch (err) {
      console.error("BlogPostFeed fetchPosts error:", err);

      if (mountedRef.current) {
        showToast("Không thể tải bài viết. Vui lòng thử lại.", "error", 3200);
      }
    } finally {
      if (mountedRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }

      isFetchingRef.current = false;
    }
  }, [showToast]);

  useEffect(() => {
    mountedRef.current = true;
    fetchPosts();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchPosts]);

  useEffect(() => {
    const handleCreatedPost = (event: Event) => {
      const customEvent = event as CustomEvent;
      const newPost = customEvent.detail;

      if (!newPost) return;

      setPosts((prev) => mergeNewPostToTop(prev, newPost));
      setLoading(false);
    };

    window.addEventListener("blog-post-created", handleCreatedPost);

    return () => {
      window.removeEventListener("blog-post-created", handleCreatedPost);
    };
  }, []);

  useEffect(() => {
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          fetchPosts();
        }
      },
      {
        rootMargin: "300px 0px",
      }
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [fetchPosts]);

  return (
    <>
      {loading && <SmartPostSkeletonFeed mode="initial" />}

      {!loading && posts.length === 0 && (
        <p className="text-center text-gray-500">Chưa có bài viết nào 🧐</p>
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

      {loadingMore && <SmartPostSkeletonFeed mode="loadMore" />}

      <div ref={loadMoreRef}></div>

      {!loading && posts.length > 0 && !hasMore && (
        <div className="text-center text-sm text-gray-400 mt-5">Hết!</div>
      )}

      {user && role === "admin" && (
        <CreatePostModal
          isOpen={open}
          editingPost={editingPost}
          onSuccess={handleEditSuccess}
          onClose={() => {
            setOpen(false);
            setEditingPost(null);
          }}
        />
      )}
    </>
  );
}