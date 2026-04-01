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
  const [refreshing, setRefreshing] = useState(false);
  const [refreshDone, setRefreshDone] = useState(false);
  const [showRefreshSkeleton, setShowRefreshSkeleton] = useState(false);
  const [feedVersion, setFeedVersion] = useState(0);

  // ✅ Chống request chồng nhau / stale closure
  const isFetchingRef = useRef(false);
  const pageRef = useRef(0);
  const hasMoreRef = useRef(true);
  const mountedRef = useRef(true);
  const postsRef = useRef<any[]>([]);

  // ⚙️ Cấu hình số lượng bài viết
  const INITIAL_LIMIT = 3;
  const LOAD_MORE_LIMIT = 2; // 👉 đổi số này thành 1 / 2 / 3... tùy ý

  const { user, role } = useUser();
  const { showToast, removeToast } = useToastContext();

  const sortPostsByPinnedAndDate = (items: any[]) => {
    return [...items].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  };

  const resetPostUiState = () => {
    setFeedVersion((prev) => prev + 1);
  };

  const syncFeedMeta = (nextPosts: any[]) => {
    postsRef.current = nextPosts;

    const loadedCount = nextPosts.length;
    const currentLimit = LOAD_MORE_LIMIT > 0 ? LOAD_MORE_LIMIT : 1;

    const nextPage =
      loadedCount <= INITIAL_LIMIT
        ? loadedCount > 0
          ? 1
          : 0
        : 1 + Math.ceil((loadedCount - INITIAL_LIMIT) / currentLimit);

    pageRef.current = nextPage;
    setPage(nextPage);
  };

  const resetFeedMetaToInitial = (nextPosts: any[]) => {
    postsRef.current = nextPosts;
    pageRef.current = nextPosts.length > 0 ? 1 : 0;
    setPage(nextPosts.length > 0 ? 1 : 0);
  };

  const mergeNewPostToTop = (prevPosts: any[], newPost: any) => {
    const filtered = prevPosts.filter((p) => p.id !== newPost.id);
    const merged = [newPost, ...filtered];
    return sortPostsByPinnedAndDate(merged);
  };

  // ✅ Soft sync: giữ số bài hiện đang xem
  const refreshCurrentWindow = useCallback(
    async (options?: { resetUi?: boolean; showRefreshUi?: boolean }) => {
      const resetUi = options?.resetUi ?? false;
      const showRefreshUi = options?.showRefreshUi ?? false;

      if (isFetchingRef.current) return;

      isFetchingRef.current = true;

      const visibleCount = Math.max(postsRef.current.length, INITIAL_LIMIT);

      if (showRefreshUi) {
        setRefreshDone(false);
        setRefreshing(true);
        setShowRefreshSkeleton(true);
      }

      try {
        const data = await getPosts(0, visibleCount - 1);

        if (!mountedRef.current) return;

        const safeData = Array.isArray(data) ? data : [];
        const sortedData = sortPostsByPinnedAndDate(safeData);

        setPosts(sortedData);
        syncFeedMeta(sortedData);

        setHasMore(safeData.length >= visibleCount);
        hasMoreRef.current = safeData.length >= visibleCount;

        if (resetUi) {
          resetPostUiState();
        }

        if (showRefreshUi) {
          setShowRefreshSkeleton(false);
          setRefreshing(false);
          setRefreshDone(true);

          setTimeout(() => {
            if (mountedRef.current) {
              setRefreshDone(false);
            }
          }, 1200);
        }
      } catch (err) {
        console.error("BlogPostFeed refreshCurrentWindow error:", err);

        if (mountedRef.current) {
          setShowRefreshSkeleton(false);
          setRefreshing(false);
          setRefreshDone(false);
          showToast("Không thể tải bài viết. Vui lòng thử lại.", "error", 3200);
        }
      } finally {
        isFetchingRef.current = false;
      }
    },
    [showToast]
  );

  // ✅ Hard refresh: reset feed về trạng thái mới tinh như lúc đầu
  const hardRefreshFeed = useCallback(async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;

    setRefreshDone(false);
    setRefreshing(true);
    setShowRefreshSkeleton(true);

    try {
      const data = await getPosts(0, INITIAL_LIMIT - 1);

      if (!mountedRef.current) return;

      const safeData = Array.isArray(data) ? data : [];
      const sortedData = sortPostsByPinnedAndDate(safeData);

      setPosts(sortedData);
      resetFeedMetaToInitial(sortedData);

      setHasMore(safeData.length >= INITIAL_LIMIT);
      hasMoreRef.current = safeData.length >= INITIAL_LIMIT;

      resetPostUiState();

      setShowRefreshSkeleton(false);
      setRefreshing(false);
      setRefreshDone(true);

      setTimeout(() => {
        if (mountedRef.current) {
          setRefreshDone(false);
        }
      }, 1200);
    } catch (err) {
      console.error("BlogPostFeed hardRefreshFeed error:", err);

      if (mountedRef.current) {
        setShowRefreshSkeleton(false);
        setRefreshing(false);
        setRefreshDone(false);
        showToast("Không thể tải bài viết. Vui lòng thử lại.", "error", 3200);
      }
    } finally {
      isFetchingRef.current = false;
      if (mountedRef.current) {
        setLoading(false);
        setLoadingMore(false);
      }
    }
  }, [showToast]);

  const fetchPosts = useCallback(
    async (forceRefresh = false) => {
      if (forceRefresh) {
        await hardRefreshFeed();
        return;
      }

      if (isFetchingRef.current) return;
      if (!hasMoreRef.current) return;

      isFetchingRef.current = true;

      const currentCount = postsRef.current.length;
      const limit = currentCount === 0 ? INITIAL_LIMIT : LOAD_MORE_LIMIT;

      const from = currentCount;
      const to = from + limit - 1;

      if (currentCount === 0) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const data = await getPosts(from, to);

        if (!mountedRef.current) return;

        const safeData = Array.isArray(data) ? data : [];

        if (safeData.length < limit) {
          setHasMore(false);
          hasMoreRef.current = false;
        }

        setPosts((prev) => {
          if (currentCount === 0) {
            const sortedData = sortPostsByPinnedAndDate(safeData);
            syncFeedMeta(sortedData);
            return sortedData;
          }

          const newPosts = safeData.filter(
            (newPost) => !prev.some((p) => p.id === newPost.id)
          );

          const merged = [...prev, ...newPosts];
          syncFeedMeta(merged);
          return merged;
        });
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
    },
    [hardRefreshFeed, showToast]
  );

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

    removeToast(pinningToastId);
    showToast(
      post.is_pinned ? "Đã bỏ ghim bài viết" : "Đã ghim bài viết",
      "success",
      2200
    );

    await refreshCurrentWindow();
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

    removeToast(deletingToastId);
    showToast("Đã xóa bài viết", "success", 2200);

    await refreshCurrentWindow();
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setOpen(true);
  };

  const handleEditSuccess = async () => {
    await refreshCurrentWindow();
  };

  useEffect(() => {
    mountedRef.current = true;
    fetchPosts();

    return () => {
      mountedRef.current = false;
    };
  }, [fetchPosts]);

  useEffect(() => {
    postsRef.current = posts;
  }, [posts]);

  useEffect(() => {
    const handleCreatedPost = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const newPost = customEvent.detail;

      if (!newPost) return;

      const optimisticMerged = mergeNewPostToTop(postsRef.current, newPost);
      const cappedOptimistic = optimisticMerged.slice(
        0,
        Math.max(postsRef.current.length, INITIAL_LIMIT)
      );

      setPosts(cappedOptimistic);
      syncFeedMeta(cappedOptimistic);
      setLoading(false);

      await refreshCurrentWindow();
    };

    window.addEventListener("blog-post-created", handleCreatedPost);

    return () => {
      window.removeEventListener("blog-post-created", handleCreatedPost);
    };
  }, [refreshCurrentWindow]);

  // Refresh Feeds Post
  useEffect(() => {
    const handleRefreshBlogFeed = async () => {
      if (isFetchingRef.current) return;
      await fetchPosts(true);
    };

    window.addEventListener("refresh-blog-feed", handleRefreshBlogFeed);

    return () => {
      window.removeEventListener("refresh-blog-feed", handleRefreshBlogFeed);
    };
  }, [fetchPosts]);
  // End

  return (
    <>
      {(refreshing || refreshDone) && (
        <div className="fixed top-33 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className={`
        flex items-center gap-2
        rounded-full border border-white/80
        bg-white/80 backdrop-blur-xl
        px-4 py-2.5
        shadow-[0_10px_35px_rgba(0,0,0,0.15)]
        text-sm font-normal text-gray-800
        transition-all duration-800
        animate-in fade-in slide-in-from-top-2 duration-300
      `}
          >
            <div className="flex items-center justify-center">
              {refreshing ? (
                <i className="fa-duotone fa-spinner-third fa-spin text-teal-600" />
              ) : (
                <i className="fa-duotone fa-circle-check text-green-600" />
              )}
            </div>

            <span>{refreshing ? "Đang tải dữ liệu" : "Đã làm mới"}</span>
          </div>
        </div>
      )}

      {showRefreshSkeleton && (
        <div className="mb-0">
          <SmartPostSkeletonFeed mode="loadMore" />
        </div>
      )}

      {loading && <SmartPostSkeletonFeed mode="initial" />}

      {!loading && posts.length === 0 && (
        <p className="text-center text-gray-500">Chưa có bài viết nào 🧐</p>
      )}

      {posts.map((post, index) => (
        <PostCard
          key={`${post.id}-${feedVersion}`}
          post={post}
          isFirst={index === 0}
          isLast={index === posts.length - 1}
          onPin={handlePin}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      ))}

      {loadingMore && (
        <div className="mt-0">
          <SmartPostSkeletonFeed mode="loadMore" />
        </div>
      )}

      {!loading && !loadingMore && hasMore && (
        <div className="flex justify-center pt-6">
          <button
            type="button"
            onClick={() => fetchPosts()}
            className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-md px-4 py-2.5 text-sm font-medium text-gray-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:bg-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)] active:scale-97 cursor-pointer"
          >
            <i className="fa-duotone fa-arrow-down" />
            Tải thêm
          </button>
        </div>
      )}

      {!loading && !loadingMore && !hasMore && posts.length > 0 && (
        <p className="text-center text-sm text-gray-500 pt-6">Hết!</p>
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