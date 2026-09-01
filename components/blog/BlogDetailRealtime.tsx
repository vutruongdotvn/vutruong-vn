"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase";
import FancyboxWrapper from "@/components/blog/FancyboxWrapper";
import PostHeader from "@/components/blog/PostHeader";
import PostBody from "@/components/blog/PostBody";
import PostActions from "@/components/blog/PostActions";
import CreatePostModal from "@/components/blog/CreatePostModal";
import { getAvatarImage } from "@/lib/cloudinary";
import { extractPostTitle, extractPostDescription } from "@/lib/postMeta";
import {
  findPostImageIndex,
  normalizePostImageUrls,
} from "@/lib/postImageRoute";
import { useUser } from "@/hooks/useUser";
import { useToastContext } from "@/components/ui/ToastProvider";
import { deletePost, pinPost } from "@/services/postService";
import { resolvePrivatePostForAdmin } from "@/services/privatePostService";

type Props = {
  postId: string;
  initialImageId?: string | null;
  routeVisibility: "public" | "privacy";
  initialPost: any | null;
  initialProfile: {
    name?: string | null;
    avatar?: string | null;
  } | null;
};

export default function BlogDetailRealtime({
  postId,
  initialImageId = null,
  routeVisibility,
  initialPost,
  initialProfile,
}: Props) {
  const router = useRouter();
  const { user, role } = useUser();
  const { showToast, removeToast } = useToastContext();

  const [post, setPost] = useState(initialPost);
  const [profile, setProfile] = useState(initialProfile);
  const [open, setOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [isResolvingPost, setIsResolvingPost] = useState(
    !initialPost && routeVisibility === "privacy"
  );
  const [isUnavailable, setIsUnavailable] = useState(false);

  const name = profile?.name || post?.author_name || "Người dùng";
  const avatar = useMemo(() => {
    return (
      getAvatarImage(profile?.avatar || post?.author_avatar) ||
      "/images/default.jpg"
    );
  }, [profile?.avatar, post?.author_avatar]);

  const postImages = useMemo(
    () => normalizePostImageUrls(post?.images),
    [post?.images]
  );
  const requestedImageIndex = useMemo(
    () => findPostImageIndex(postImages, initialImageId),
    [initialImageId, postImages]
  );

  const isAdmin = !!user && role === "admin";

  useEffect(() => {
    // Bài công khai đã được server tải sẵn, không cần fetch lần hai.
    // Route không tồn tại đã bị page.tsx chặn bằng notFound() trước khi
    // component này được mount.
    if (initialPost || routeVisibility !== "privacy" || !postId) {
      return;
    }

    let cancelled = false;

    const resolvePrivatePost = async () => {
      setIsResolvingPost(true);
      setIsUnavailable(false);

      try {
        const result = await resolvePrivatePostForAdmin(postId);

        if (cancelled) return;

        if (result.status !== "granted") {
          if (!cancelled) setIsUnavailable(true);
          return;
        }

        setPost(result.post);
        setProfile(result.profile);
        setIsUnavailable(false);
      } catch (error: unknown) {
        console.error(
          "[BlogDetail] private post resolution failed:",
          error instanceof Error ? error.message : "Unknown error"
        );

        if (!cancelled) setIsUnavailable(true);
      } finally {
        if (!cancelled) setIsResolvingPost(false);
      }
    };

    void resolvePrivatePost();

    return () => {
      cancelled = true;
    };
  }, [initialPost, postId, routeVisibility]);

  useEffect(() => {
    if (!initialImageId || !post || requestedImageIndex >= 0) return;

    const basePath = `/blog/post/${postId}`;

    // ID đúng định dạng nhưng không thuộc bài (kể cả bài không có ảnh): giữ
    // nguyên trang chi tiết và chỉ chuẩn hóa URL, không refetch hoặc reload.
    if (window.location.pathname.startsWith(`${basePath}/`)) {
      window.history.replaceState(null, "", basePath);
    }
  }, [initialImageId, post, postId, requestedImageIndex]);

  const handlePin = async () => {
    if (!post) return;

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

    setPost((prev: any) =>
      prev
        ? {
          ...prev,
          is_pinned: prev.is_pinned ? false : true,
        }
        : prev
    );

    removeToast(pinningToastId);
    showToast(
      post.is_pinned ? "Đã bỏ ghim bài viết" : "Đã ghim bài viết",
      "success",
      2200
    );

    router.refresh();
  };

  const handleDelete = async () => {
    if (!post) return;
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

    router.replace("/blog");
    router.refresh();
  };

  const handleEdit = () => {
    setEditingPost(post);
    setOpen(true);
  };

  const handleEditSuccess = async (updatedPost: any) => {
    setPost(updatedPost);
    setEditingPost(updatedPost);

    // refresh nhẹ để server page / metadata / fallback data sync lại
    router.refresh();

    // nếu author info fallback đang lệch thì lấy lại profile mới luôn
    if (updatedPost?.user_id) {
      const { data: freshProfile } = await supabase
        .from("profiles")
        .select("name, avatar")
        .eq("id", updatedPost.user_id)
        .maybeSingle();

      if (freshProfile) {
        setProfile(freshProfile);
      }
    }
  };

  useEffect(() => {
    if (!post?.id) return;

    const channel = supabase
      .channel(`blog-detail-${post.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
          filter: `id=eq.${post.id}`,
        },
        () => {
          // Detail page không cần state realtime quá nặng:
          // chỉ refresh lại trang cho sạch và an toàn
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "posts",
          filter: `id=eq.${post.id}`,
        },
        () => {
          showToast("Bài viết này đã bị xóa", "warning", 2200);
          router.replace("/blog");
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [post?.id, router, showToast]);

  if (isResolvingPost) {
    return (
      <article
        aria-busy="true"
        aria-live="polite"
        className="rounded-0 sm:rounded-2xl bg-white/80 p-6 text-center text-sm text-gray-500 shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md"
      >
        <i className="fad fa-spinner-third fa-spin mr-2" />
        Đang xác minh tài khoản
      </article>
    );
  }

  if (!post || isUnavailable) {
    return (
      <article className="rounded-0 sm:rounded-2xl bg-white/80 p-6 py-18 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md">
        <i className="fa-duotone fa-lock-keyhole mb-3 text-2xl text-red-400" />
        <h1 className="text-lg font-semibold text-red-400">
          Truy cập bị từ chối
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Bạn không có quyền xem nội dung này
        </p>
      </article>
    );
  }

  return (
    <>
      <FancyboxWrapper
        postId={post.id}
        images={postImages}
        initialImageId={requestedImageIndex >= 0 ? initialImageId : null}
      />

      <article
        className="fullPost"
      >
        <div className="actionFooter md:px-4 px-3 md:pt-4 pt-3">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black active:scale-97"
          >
            <i className="fa-duotone fa-arrow-left text-xs" />
            Quay lại
          </Link>
        </div>

        <PostHeader
          name={name}
          avatar={avatar}
          createdAt={post.created_at}
          postId={post.id}
          showLink={false}
          showMenu={isAdmin}
          isAdmin={isAdmin}
          isPinned={post.is_pinned}
          visibility={post.visibility}
          onPin={handlePin}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <PostBody content={post.content} images={postImages} postId={post.id} />

        <PostActions
          postId={post.id}
          postTitle={extractPostTitle(post.content)}
          postDescription={extractPostDescription(post.content)}
        />
      </article>

      {isAdmin && (
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
