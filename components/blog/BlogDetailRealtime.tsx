"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound, useRouter } from "next/navigation";

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

type PrivateResolutionStatus =
  | "checking"
  | "granted"
  | "denied"
  | "not_found"
  | "unavailable";

type PrivateAccessScope = "admin" | "public" | null;

export default function BlogDetailRealtime({
  postId,
  initialImageId = null,
  routeVisibility,
  initialPost,
  initialProfile,
}: Props) {
  const router = useRouter();
  const { user, role, loading: authLoading } = useUser();
  const { showToast, removeToast } = useToastContext();

  const [post, setPost] = useState(initialPost);
  const [profile, setProfile] = useState(initialProfile);
  const [open, setOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<any | null>(null);
  const [privateResolutionStatus, setPrivateResolutionStatus] =
    useState<PrivateResolutionStatus>(
      !initialPost && routeVisibility === "privacy" ? "checking" : "granted"
    );

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

  // Giữ quyền admin ổn định trong lúc refresh token, nhưng chuyển về trạng
  // thái chưa xác minh ngay khi danh tính thay đổi. Nội dung privacy vì thế
  // không thể còn hiển thị cho phiên guest/user cũ trong khi effect dọn state.
  const privateAccessScope: PrivateAccessScope =
    user && role === "admin" ? "admin" : authLoading ? null : "public";
  const isAdmin = privateAccessScope === "admin";

  useEffect(() => {
    // Bài công khai đã được server tải sẵn, không cần fetch lần hai. Bài
    // privacy chỉ được tải sau khi auth context đã xác minh đúng admin; service
    // vẫn kiểm tra lại JWT + registry + RLS trước khi trả nội dung.
    if (initialPost || routeVisibility !== "privacy" || !postId) {
      return;
    }

    let cancelled = false;

    if (privateAccessScope !== "admin") {
      setPost(null);
      setProfile(null);
      setPrivateResolutionStatus(
        privateAccessScope === null ? "checking" : "denied"
      );
      return;
    }

    const resolvePrivatePost = async () => {
      setPost(null);
      setProfile(null);
      setPrivateResolutionStatus("checking");

      try {
        const result = await resolvePrivatePostForAdmin(postId);

        if (cancelled) return;

        if (result.status !== "granted") {
          setPrivateResolutionStatus(result.status);
          return;
        }

        setPost(result.post);
        setProfile(result.profile);
        setPrivateResolutionStatus("granted");
      } catch (error: unknown) {
        console.error(
          "[BlogDetail] private post resolution failed:",
          error instanceof Error ? error.message : "Unknown error"
        );

        if (!cancelled) setPrivateResolutionStatus("unavailable");
      }
    };

    void resolvePrivatePost();

    return () => {
      cancelled = true;
    };
  }, [initialPost, postId, privateAccessScope, routeVisibility]);

  useEffect(() => {
    // Metadata server tiếp tục dùng title not-found cho privacy để không tạo
    // oracle công khai. Chỉ sau khi browser đã xác minh admin và tải đúng row
    // privacy thành công mới được sửa title hiển thị của tab.
    const hasVerifiedPrivatePost =
      routeVisibility === "privacy" &&
      privateAccessScope === "admin" &&
      privateResolutionStatus === "granted" &&
      post?.visibility === "privacy";

    if (!hasVerifiedPrivatePost) return;

    const previousTitle = document.title;
    const privateTitle = "Bài viết riêng tư";
    document.title = privateTitle;

    return () => {
      // Không ghi đè metadata của route kế tiếp nếu Next.js đã cập nhật title.
      if (document.title === privateTitle) {
        document.title = previousTitle;
      }
    };
  }, [
    post?.visibility,
    privateAccessScope,
    privateResolutionStatus,
    routeVisibility,
  ]);

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

  if (
    routeVisibility === "privacy" &&
    (privateAccessScope === null ||
      (privateAccessScope === "admin" &&
        privateResolutionStatus === "checking"))
  ) {
    return (
      <article
        aria-busy="true"
        aria-live="polite"
        className="flex min-h-[20rem] flex-col items-center justify-center rounded-0 bg-card/80 p-4 text-center shadow-[0_8px_30px_rgba(0,0,0,0.04)] backdrop-blur-md sm:rounded-2xl"
      >
        <span className="sr-only">Đang tải bài viết</span>
      </article>
    );
  }

  // Render-level deny: không chờ effect dọn state khi admin vừa đăng xuất hoặc
  // đổi tài khoản. Guest/user và ID không tồn tại vẫn dùng chung 404 để không
  // tiết lộ rằng một bài privacy có tồn tại.
  if (routeVisibility === "privacy" && privateAccessScope === "public") {
    notFound();
  }

  // Guest, user thường và admin truy cập ID không tồn tại đều đi qua cùng
  // not-found boundary. Không hiển thị thông báo "bài riêng tư" vì thông tin
  // đó có thể biến route thành oracle dò sự tồn tại của nội dung private.
  if (
    !post &&
    (privateResolutionStatus === "denied" ||
      privateResolutionStatus === "not_found")
  ) {
    notFound();
  }

  if (!post || privateResolutionStatus === "unavailable") {
    return (
      <article className="rounded-0 sm:rounded-2xl p-4 py-24 text-center">
        <i className="fa-duotone fa-cloud-exclamation mb-3 text-2xl text-red-600 dark:text-red-300" />
        <h1 className="text-lg font-semibold text-red-600 dark:text-red-300">
          Không thể tải bài viết
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Dữ liệu bài viết hiện không khả dụng. Vui lòng thử lại sau.
        </p>

        <Link className="flex items-center gap-3 justify-center mt-6 px-6 py-3 mx-auto bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-95 w-sm max-w-full" href="/blog">
          <i className="fad fa-arrow-left" /> Quay lại Blog
        </Link>
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
            className="inline-flex items-center gap-2 text-sm text-foreground/75 hover:text-foreground active:scale-97"
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
