"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import PostCard from "@/components/blog/PostCard";
import PostCardSkeleton from "@/components/blog/PostCardSkeleton";
import CreatePostModal from "@/components/blog/CreatePostModal";
import { getPosts, pinPost, deletePost } from "@/services/postService";
import { useToastContext } from "@/components/ui/ToastProvider";
import { useUser } from "@/hooks/useUser";

// ─── Cấu hình chế độ tải bài viết ────────────────────────────────────────────
// Thay đổi giá trị này để chuyển đổi chế độ tải bài viết:
//   "button" → hiển thị nút "Xem thêm", người dùng bấm để tải
//   "scroll" → tự động tải khi cuộn đến cuối danh sách (Infinity Scroll)
const FEED_MODE: "button" | "scroll" = "scroll";

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

  // ─── Infinity scroll refs ────────────────────────────────────────────────────
  /** Phần tử sentinel ở cuối danh sách, được IntersectionObserver theo dõi */
  const sentinelRef = useRef<HTMLDivElement>(null);
  /** Cờ bảo vệ: ngăn kích hoạt lại trong thời gian chờ delay */
  const isScrollPendingRef = useRef(false);
  /** Timer ID của delay trước khi fetch */
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ⚙️ Cấu hình số lượng bài viết
  const INITIAL_LIMIT = 6;
  const LOAD_MORE_LIMIT = 6;

  /**
   * ⚙️ Độ trễ (ms) áp dụng cho chế độ infinity scroll.
   *
   * Luồng hoạt động khi scroll chạm sentinel:
   *   1. PostCardSkeleton hiển thị ngay lập tức (setLoadingMore → true)
   *   2. Chờ SCROLL_FETCH_DELAY ms
   *   3. Gọi fetchPosts() → thực sự lấy dữ liệu từ API/database
   *
   * Tăng giá trị này để giảm tần suất gọi API; giảm để phản hồi nhanh hơn.
   */
  const SCROLL_FETCH_DELAY = 500;

  const { user, role } = useUser();
  const { showToast, removeToast } = useToastContext();

  // ─── Helpers (không thay đổi) ────────────────────────────────────────────────
  const sortPostsByPinnedAndDate = (items: any[]) => {
    return [...items].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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
        ? loadedCount > 0 ? 1 : 0
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

  // ─── refreshCurrentWindow (không thay đổi) ───────────────────────────────────
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

        if (resetUi) resetPostUiState();

        if (showRefreshUi) {
          setShowRefreshSkeleton(false);
          setRefreshing(false);
          setRefreshDone(true);
          setTimeout(() => {
            if (mountedRef.current) setRefreshDone(false);
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

  // ─── hardRefreshFeed (không thay đổi) ────────────────────────────────────────
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
        if (mountedRef.current) setRefreshDone(false);
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

  // ─── fetchPosts (không thay đổi) ─────────────────────────────────────────────
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

  // ─── Handlers (không thay đổi) ───────────────────────────────────────────────
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

  // ─── Effects (không thay đổi) ────────────────────────────────────────────────
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
    const handleUpdatedPost = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const updatedPost = customEvent.detail;
      if (!updatedPost) return;

      // 🧠 UPDATE LOCAL STATE NGAY
      const updatedList = postsRef.current.map((p) =>
        p.id === updatedPost.id ? { ...p, ...updatedPost } : p
      );

      // 🔥 SORT LẠI (QUAN TRỌNG CHO DATE + PIN)
      const sorted = sortPostsByPinnedAndDate(updatedList);

      setPosts(sorted);
      syncFeedMeta(sorted);

      // 🔁 fallback sync server (giữ realtime chuẩn)
      await refreshCurrentWindow({ resetUi: false });
    };

    window.addEventListener("blog-post-updated", handleUpdatedPost);
    return () => {
      window.removeEventListener("blog-post-created", handleCreatedPost);
      window.removeEventListener("blog-post-updated", handleUpdatedPost);
    };
  }, [refreshCurrentWindow]);

  // Refresh Feeds Post
  useEffect(() => {
    const handleRefreshBlogFeed = async () => {
      if (isFetchingRef.current) return;
      await fetchPosts(true);
    };
    window.addEventListener("refresh-blog-feed", handleRefreshBlogFeed);
    return () => window.removeEventListener("refresh-blog-feed", handleRefreshBlogFeed);
  }, [fetchPosts]);
  // End

  // ─── Infinity scroll – IntersectionObserver ──────────────────────────────────
  /**
   * Luồng khi sentinel vào viewport (chế độ "scroll"):
   *   1. isScrollPendingRef = true  → khóa trigger kép trong thời gian delay
   *   2. setLoadingMore(true)        → PostCardSkeleton hiển thị ngay
   *   3. setTimeout(SCROLL_FETCH_DELAY) → chờ
   *   4. fetchPosts()                → gọi API, skeleton tắt sau khi xong
   */
  useEffect(() => {
    if (FEED_MODE !== "scroll") return;

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (isFetchingRef.current) return;
        if (isScrollPendingRef.current) return;
        if (!hasMoreRef.current) return;
        // Bug 3 fix: guard – chưa có bài nào thì chưa fetch thêm
        if (postsRef.current.length === 0) return;

        // ① Khoá trigger kép
        isScrollPendingRef.current = true;

        // ② Hiển thị skeleton ngay lập tức
        setLoadingMore(true);

        // ③ Huỷ timer cũ (nếu có) rồi tạo timer mới
        if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);

        scrollTimerRef.current = setTimeout(async () => {
          isScrollPendingRef.current = false;

          if (!mountedRef.current) {
            setLoadingMore(false);
            return;
          }

          if (!hasMoreRef.current) {
            setLoadingMore(false);
            return;
          }

          // ④ Gọi fetchPosts – KHÔNG setLoadingMore(false) ở đây.
          //    Skeleton đang hiển thị (từ bước ②); fetchPosts sẽ tự
          //    setLoadingMore(false) sau khi fetch xong → không bị flash.
          await fetchPosts();
        }, SCROLL_FETCH_DELAY);
      },
      {
        // Kích hoạt trước 200px so với cạnh dưới viewport
        rootMargin: "0px 0px 200px 0px",
        threshold: 0,
      }
    );

    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      isScrollPendingRef.current = false;
    };
  }, [fetchPosts]);

  // ─── Cleanup scrollTimerRef khi unmount ─────────────────────────────────────
  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Refresh indicator */}
      {(refreshing || refreshDone) && (
        <div className="fixed top-33 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
          <div
            className={`
              flex items-center justify-center gap-2
              rounded-full
              bg-white/60 backdrop-blur-2xl
              w-12 h-12 text-center mx-auto
              shadow-[0_10px_35px_rgba(0,0,0,0.3)]
              text-sm font-normal text-gray-800
              transition-all duration-800
              animate-in fade-in slide-in-from-top-2 duration-300
            `}
          >
            <div className="flex items-center justify-center text-3xl">
              {refreshing ? (
                <i
                  className="fad fa-spinner-third fa-spin text-slate-600"
                  style={{ "--fa-animation-duration": ".65s" } as React.CSSProperties}
                />
              ) : (
                <i className="fas fa-circle-check text-green-600" />
              )}
            </div>
          </div>
        </div>
      )}

      {showRefreshSkeleton && <PostCardSkeleton count={INITIAL_LIMIT} />}

      {loading && <PostCardSkeleton count={INITIAL_LIMIT} />}

      {!loading && posts.length === 0 && (
        <p className="text-center text-gray-500">Chưa có bài viết nào 🧐</p>
      )}

      {posts
        .filter((post) => {
          if (post.visibility === "public") return true;
          if (post.visibility === "privacy" && role === "admin") return true;
          return false;
        })
        .map((post, index, arr) => (
          <PostCard
            key={`${post.id}-${feedVersion}`}
            post={post}
            isFirst={index === 0}
            isLast={index === arr.length - 1}
            onPin={handlePin}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      {/* Skeleton khi tải thêm */}
      {loadingMore && <PostCardSkeleton count={LOAD_MORE_LIMIT} />}

      {/*
        Sentinel cho infinity scroll – luôn có trong DOM khi FEED_MODE = "scroll".
        KHÔNG bọc !loading: khi mount (loading=true) sentinel sẽ chưa có trong DOM
        → sentinelRef.current = null → IntersectionObserver setup thất bại → scroll không hoạt động.
        Guard "đang loading / chưa có bài" được xử lý bên trong observer callback.
      */}
      {FEED_MODE === "scroll" && (
        <div ref={sentinelRef} aria-hidden="true" className="h-0 w-0" />
      )}

      {/* ── Khu vực "Xem thêm" / end ── */}
      {!loading && !loadingMore && (
        <div className="flex flex-col items-center gap-3 py-6">

          {/* Nút Xem thêm – chỉ hiện ở chế độ button */}
          {hasMore && FEED_MODE === "button" && (
            <button
              type="button"
              onClick={() => fetchPosts()}
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/80 backdrop-blur-md px-5 py-2.5 text-sm font-medium text-gray-800 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:bg-white hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)] cursor-pointer"
            >
              <i className="fa-duotone fa-arrow-down" />
              Xem thêm
            </button>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="text-sm text-gray-400">Không còn kết quả nào khác</p>
          )}
        </div>
      )}

      {/* Modal chỉnh sửa bài viết */}
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