"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import PostCard from "@/components/blog/PostCard";
import SmartPostSkeletonFeed from "@/components/blog/SmartPostSkeletonFeed";
import CreatePostModal from "@/components/blog/CreatePostModal";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper";
import LoginModal from "@/components/auth/LoginModal";
import BlogUserCard from "@/components/blog/BlogUserCard";
import BlogUserCardSkeleton from "@/components/blog/BlogUserCardSkeleton";

import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { buildCloudinaryImage } from "@/lib/cloudinary";
import { useToastContext } from "@/components/ui/ToastProvider";

import {
  getPostsByHashtag,
  countPostsByHashtag,
  pinPost,
  deletePost,
} from "@/services/postService";

export default function BlogTagPage() {
  const router = useRouter();
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
  const { showToast, removeToast } = useToastContext();

  const displayTag = useMemo(() => {
    return tagName.startsWith("#") ? tagName : `#${tagName}`;
  }, [tagName]);

  const normalizeHashtags = (hashtags: any): string[] => {
    if (!Array.isArray(hashtags)) return [];
    return hashtags
      .map((tag) => String(tag).trim().toLowerCase().replace(/^#/, ""))
      .filter(Boolean);
  };

  const postHasCurrentTag = (post: any) => {
    const normalized = normalizeHashtags(post?.hashtags);
    return normalized.includes(tagName.replace(/^#/, ""));
  };

  useEffect(() => {
  const handleCreatedPost = (event: Event) => {
    const customEvent = event as CustomEvent;
    const newPost = customEvent.detail;

    if (!newPost) return;
    if (!postHasCurrentTag(newPost)) return;

    setPosts((prev) => {
      if (prev.some((p) => p.id === newPost.id)) return prev;
      return sortPosts([newPost, ...prev]);
    });

    setTotalPosts((prev) => prev + 1);
    setLoading(false);
  };

  window.addEventListener("blog-post-created", handleCreatedPost);

  return () => {
    window.removeEventListener("blog-post-created", handleCreatedPost);
  };
}, [tagName]);

  const sortPosts = (list: any[]) => {
    return [...list].sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }

      return (
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    });
  };

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

  const fetchTotalPosts = async () => {
    if (!tagName) return;
    const total = await countPostsByHashtag(tagName);
    setTotalPosts(total);
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

    setPosts((prev) =>
      sortPosts(
        prev.map((p) =>
          p.id === post.id ? { ...p, is_pinned: !p.is_pinned } : p
        )
      )
    );

    removeToast(pinningToastId);
    showToast(
      post.is_pinned ? "Đã bỏ ghim bài viết" : "Đã ghim bài viết",
      "success",
      2200
    );

    router.refresh();
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
    setTotalPosts((prev) => Math.max(0, prev - 1));

    removeToast(deletingToastId);
    showToast("Đã xóa bài viết", "success", 2200);

    router.refresh();
  };

  const handleEdit = (post: any) => {
    setEditingPost(post);
    setOpen(true);
  };

  const handleEditSuccess = async (updatedPost: any) => {
    const stillHasTag = postHasCurrentTag(updatedPost);

    if (!stillHasTag) {
      setPosts((prev) => prev.filter((p) => p.id !== updatedPost.id));
      setTotalPosts((prev) => Math.max(0, prev - 1));
    } else {
      setPosts((prev) =>
        sortPosts(
          prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
        )
      );
    }

    setEditingPost(updatedPost);
    router.refresh();
    fetchTotalPosts();
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
      if (page === 0) return sortPosts(data || []);

      const newPosts = data.filter(
        (newPost: any) => !prev.some((p) => p.id === newPost.id)
      );

      return sortPosts([...prev, ...newPosts]);
    });

    setPage((prev) => prev + 1);
    setLoading(false);
    setLoadingMore(false);
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

      setPosts(sortPosts(firstBatch || []));
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

  useEffect(() => {
    if (!tagName) return;

    const normalizedTag = tagName.replace(/^#/, "");

    const channel = supabase
      .channel(`blog-tag-${normalizedTag}`)

      .on(
  "postgres_changes",
  {
    event: "INSERT",
    schema: "public",
    table: "posts",
  },
  async (payload) => {
    const inserted = payload.new as any;

    if (!postHasCurrentTag(inserted)) return;

    const { data: freshPost } = await supabase
      .from("posts")
      .select("*")
      .eq("id", inserted.id)
      .maybeSingle();

    if (!freshPost) return;

    setPosts((prev) => {
      if (prev.some((p) => p.id === freshPost.id)) return prev;
      return sortPosts([freshPost, ...prev]);
    });

    setTotalPosts((prev) => prev + 1);
    router.refresh();
  }
)

      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
        },
        async (payload) => {
          const updatedPost = payload.new as any;
          const stillHasTag = postHasCurrentTag(updatedPost);

          setPosts((prev) => {
            const exists = prev.some((p) => p.id === updatedPost.id);

            if (exists && !stillHasTag) {
              return prev.filter((p) => p.id !== updatedPost.id);
            }

            if (exists && stillHasTag) {
              return sortPosts(
                prev.map((p) => (p.id === updatedPost.id ? updatedPost : p))
              );
            }

            if (!exists && stillHasTag) {
              return sortPosts([updatedPost, ...prev]);
            }

            return prev;
          });

          fetchTotalPosts();
          router.refresh();
        }
      )

      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          const deletedPost = payload.old as any;

          setPosts((prev) => prev.filter((p) => p.id !== deletedPost.id));
          fetchTotalPosts();
          router.refresh();
        }
      )

      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tagName, router]);

  const fullName = user ? profile?.name || "Người dùng" : "Xin chào! 👋";
  const email = user?.email || "";

  const avatar = user
    ? buildCloudinaryImage(profile?.avatar, {
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
        <>
          <BlogUserCardSkeleton />

          <div className="space-y-6">
            <div className="flex items-center justify-between rounded-2xl bg-white/80 backdrop-blur-md px-4 py-5 animate-pulse shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
              <div className="w-40 h-5 bg-gray-200 rounded-xl" />
              <div className="w-25 h-5 bg-gray-200 rounded-xl" />
            </div>

            <SmartPostSkeletonFeed mode="initial" />
          </div>
        </>
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

          <div className="mb-7 rounded-2xl bg-white/80 backdrop-blur-md px-5 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-base text-gray-800">
                  <span>
                    <i className="fa-duotone fa-tags me-2"/>
                    {totalPosts > 0
                      ? `${totalPosts} bài viết có `
                      : `Hông có bài viết nào có `}
                  </span>
                  <span className="text-gray-800 font-semibold hover:text-black">
                    {displayTag}
                  </span>
                </h1>
              </div>

              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-black active:scale-97 transition"
              >
                <i className="fa-duotone fa-arrow-left" />
                Quay lại Blog
              </Link>
            </div>
          </div>

          {user && role !== "admin" && (
            <p className="text-center text-gray-500 text-sm">
              Bạn chỉ có quyền xem bài viết 👀
            </p>
          )}

          {loading && <SmartPostSkeletonFeed mode="initial" />}

          {!loading && posts.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              Chưa có bài viết nào có hashtag{" "}
              <span className="font-medium">{displayTag}</span> cả 🧐
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

          {loadingMore && <SmartPostSkeletonFeed mode="loadMore" />}

          <div ref={loadMoreRef}></div>

          {!loading && posts.length > 0 && !hasMore && (
            <div className="text-center text-sm text-gray-400 mt-5">Hết!</div>
          )}

          {user && role === "admin" && (
  <CreatePostModal
    isOpen={open}
    editingPost={editingPost}
    onSuccess={(savedPost) => {
      if (editingPost) {
        handleEditSuccess(savedPost);
      } else {
        window.dispatchEvent(
          new CustomEvent("blog-post-created", {
            detail: savedPost,
          })
        );
      }
    }}
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