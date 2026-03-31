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

import { extractPostTitle, extractPostDescription } from "@/lib/postMeta";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";
import { useUser } from "@/hooks/useUser";
import { useToastContext } from "@/components/ui/ToastProvider";
import { pinPost, deletePost } from "@/services/postService";

type Props = {
  initialPost: any;
  initialProfile: {
    name?: string | null;
    avatar?: string | null;
  } | null;
};

export default function BlogDetailRealtime({
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

  const name = profile?.name || post?.author_name || "Người dùng";
  const avatar = useMemo(() => {
    return (
      optimizeCloudinaryImage(profile?.avatar || post?.author_avatar, {
        width: 80,
        height: 80,
        quality: 80,
        crop: "fill",
      }) || "/images/default.jpg"
    );
  }, [profile?.avatar, post?.author_avatar]);

  const isAdmin = !!user && role === "admin";

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

  if (!post) return null;

  return (
    <>
      <FancyboxWrapper />

      <article
        className="fullPost rounded-2xl bg-white/80 backdrop-blur-md
        shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.06)]"
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
          isPinned={post.is_pinned}
          onPin={handlePin}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        <PostBody content={post.content} images={post.images} postId={post.id} />

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