"use client";

import { useEffect, useRef, useState } from "react";
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

  const LIMIT = 3;

  const { user, role } = useUser();
  const { showToast } = useToastContext();

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

    console.log("🔥 DELETE RESULT:", res);
    window.location.reload();
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setOpen(true);
  };

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
    if (!loadMoreRef.current) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasMore && !loadingMore) {
        fetchPosts();
      }
    });

    observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page]);

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
          onClose={() => {
            setOpen(false);
            setEditingPost(null);
          }}
        />
      )}
    </>
  );
}