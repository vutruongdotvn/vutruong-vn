"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PostBody from "@/components/blog/PostBody";
import PostActions from "@/components/blog/PostActions";
import ModalPostHeader from "@/components/blog/modal/ModalPostHeader";
import ModalPostMedia from "@/components/blog/modal/ModalPostMedia";
import {
  ModalPostFrame,
  ModalPostSkeletonContent,
} from "@/components/blog/modal/ModalFullPostSkeleton";
import { extractPostDescription, extractPostTitle } from "@/lib/postMeta";
import {
  findPostImageIndex,
  normalizePostImageUrls,
} from "@/lib/postImageRoute";
import { loadPublicModalPost } from "@/services/publicModalPostService";
import {
  resolvePrivatePostForAdmin,
  type PrivatePostProfile,
  type PrivatePostRecord,
} from "@/services/privatePostService";

export type ModalFullPostData = {
  id: string;
  content: string;
  images: string[];
  createdAt: string;
  author: {
    name: string;
    avatar: string | null;
  };
};

type PrivateResolutionStatus =
  "checking" | "granted" | "denied" | "unavailable";

type PrivateResolution = {
  postId: string;
  status: PrivateResolutionStatus;
  post: ModalFullPostData | null;
};

type PublicResolution = {
  postId: string;
  status: "checking" | "granted" | "unavailable";
  post: ModalFullPostData | null;
};

type ModalFullPostV2Props = {
  postId: string;
  initialImageId?: string | null;
  routeVisibility: "public" | "privacy";
  post: ModalFullPostData | null;
  documentTitle: string;
  loadPublicPost?: boolean;
};

function getOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function createPrivateModalPostData(
  post: PrivatePostRecord,
  profile: PrivatePostProfile | null,
): ModalFullPostData | null {
  const createdAt = getOptionalString(post.created_at);

  if (!createdAt) return null;

  return {
    id: post.id,
    content: typeof post.content === "string" ? post.content : "",
    images: normalizePostImageUrls(post.images),
    createdAt,
    author: {
      name:
        getOptionalString(profile?.name) ||
        getOptionalString(post.author_name) ||
        "Người dùng",
      avatar:
        getOptionalString(profile?.avatar) ||
        getOptionalString(post.author_avatar),
    },
  };
}

export default function ModalFullPostV2({
  postId,
  initialImageId = null,
  routeVisibility,
  post,
  documentTitle,
  loadPublicPost = false,
}: ModalFullPostV2Props) {
  const router = useRouter();
  const isClosingRef = useRef(false);
  const [publicResolution, setPublicResolution] = useState<PublicResolution>({
    postId,
    status: "checking",
    post: null,
  });
  const [privateResolution, setPrivateResolution] = useState<PrivateResolution>(
    () => ({
      postId,
      status:
        post !== null
          ? "granted"
          : routeVisibility === "privacy"
            ? "checking"
            : "unavailable",
      post: null,
    }),
  );

  const privateStatus: PrivateResolutionStatus =
    post !== null
      ? "granted"
      : routeVisibility !== "privacy"
        ? "unavailable"
        : privateResolution.postId === postId
          ? privateResolution.status
          : "checking";
  const resolvedPrivatePost =
    privateResolution.postId === postId &&
      privateResolution.status === "granted"
      ? privateResolution.post
      : null;
  const needsPublicLoad =
    loadPublicPost && routeVisibility === "public" && !post;
  const publicStatus =
    publicResolution.postId === postId ? publicResolution.status : "checking";
  const resolvedPublicPost =
    needsPublicLoad &&
      publicResolution.postId === postId &&
      publicStatus === "granted"
      ? publicResolution.post
      : null;
  const resolutionStatus = needsPublicLoad ? publicStatus : privateStatus;
  const activePost =
    post ??
    (routeVisibility === "privacy" ? resolvedPrivatePost : resolvedPublicPost);
  const hasMedia = !!activePost?.images.length;
  const postTitle = activePost
    ? extractPostTitle(activePost.content) || documentTitle
    : documentTitle;
  const postDescription = activePost
    ? extractPostDescription(activePost.content)
    : undefined;
  const resolvedDocumentTitle =
    routeVisibility === "public" ? postTitle : documentTitle;

  const closeModal = useCallback(() => {
    if (isClosingRef.current) return;

    isClosingRef.current = true;
    router.back();
  }, [router]);

  useEffect(() => {
    if (!needsPublicLoad) return;
    let cancelled = false;

    setPublicResolution({ postId, status: "checking", post: null });
    void loadPublicModalPost(postId).then((publicPost) => {
      if (cancelled) return;
      setPublicResolution({
        postId,
        status: publicPost ? "granted" : "unavailable",
        post: publicPost,
      });
    });

    // Không hủy request dùng chung: đóng rồi mở lại sẽ dùng đúng Promise đó.
    // Component đã đóng/đổi bài không được nhận kết quả của request cũ.
    return () => {
      cancelled = true;
    };
  }, [needsPublicLoad, postId]);

  useEffect(() => {
    // Giữ nguyên luồng privacy: xác minh session và query bằng JWT ở browser.
    // Service cache public phía trên không tham gia bước này.
    if (post || routeVisibility !== "privacy") return;

    let cancelled = false;

    setPrivateResolution({
      postId,
      status: "checking",
      post: null,
    });

    const resolvePrivatePost = async () => {
      const result = await resolvePrivatePostForAdmin(postId);
      if (cancelled) return;

      if (result.status !== "granted") {
        setPrivateResolution({
          postId,
          status: result.status,
          post: null,
        });
        return;
      }

      const modalPost = createPrivateModalPostData(result.post, result.profile);

      setPrivateResolution({
        postId,
        status: modalPost ? "granted" : "unavailable",
        post: modalPost,
      });
    };

    void resolvePrivatePost();

    return () => {
      cancelled = true;
    };
  }, [post, postId, routeVisibility]);

  useEffect(() => {
    // Fallback cho trường hợp Next.js không áp dụng metadata của Parallel Route
    // sau soft navigation. Canonical metadata vẫn được tạo hoàn toàn ở server.
    const previousTitle = document.title;
    const nextTitle = resolvedDocumentTitle.trim();

    if (nextTitle) {
      document.title = nextTitle;
    }

    return () => {
      document.title = previousTitle;
    };
  }, [resolvedDocumentTitle]);

  useEffect(() => {
    if (
      !initialImageId ||
      !activePost ||
      findPostImageIndex(activePost.images, initialImageId) >= 0
    ) {
      return;
    }

    const basePath = `/blog/post/${postId}`;

    // Đặt validation ở cấp modal để cả bài không có media cũng được xử lý;
    // ModalPostMedia không tồn tại trong trường hợp đó.
    if (window.location.pathname.startsWith(`${basePath}/`)) {
      window.history.replaceState(null, "", basePath);
    }
  }, [activePost, initialImageId, postId]);

  const isChecking = resolutionStatus === "checking" && !activePost;

  return (
    <ModalPostFrame
      onClose={closeModal}
      layout={
        activePost
          ? hasMedia
            ? "media"
            : "text"
          : isChecking
            ? undefined
            : "text"
      }
      busy={isChecking}
      title={resolvedDocumentTitle}
    >
      {isChecking ? (
        <ModalPostSkeletonContent />
      ) : activePost ? (
        <>
          {hasMedia && (
            <ModalPostMedia
              key={`${activePost.id}:${initialImageId ?? "default"}`}
              postId={activePost.id}
              images={activePost.images}
              initialImageId={initialImageId}
              postTitle={postTitle}
              onClose={closeModal}
            />
          )}

          <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-card">
            <div className="shrink-0">
              <ModalPostHeader
                name={activePost.author.name}
                avatar={activePost.author.avatar}
                createdAt={activePost.createdAt}
                visibility={routeVisibility}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
              <PostBody
                content={activePost.content}
                images={[]}
                postId={activePost.id}
                truncate={false}
              />
              <PostActions
                postId={activePost.id}
                postTitle={postTitle}
                postDescription={postDescription}
              />
              <div className="mt-3 flex flex-col select-none items-center gap-3 p-3 text-[.9375rem] text-muted-foreground sm:mt-4 sm:p-4 pb-8">
                <i
                  className="fal fa-comment-slash fa-2x opacity-50"
                  aria-hidden="true"
                />
                <span>Không cho phép đăng bình luận mới.</span>
              </div>

            </div>

            {/* <div className="shrink-0 border-t border-border bg-card">
              <PostActions
                postId={activePost.id}
                postTitle={postTitle}
                postDescription={postDescription}
              />
            </div> */}
          </div>
        </>
      ) : (
        <div
          aria-live="polite"
          className="flex min-h-0 flex-1 items-center justify-center px-6 py-16 text-center"
        >
          <div className="max-w-sm">
            <i
              className="fa-duotone fa-lock-keyhole text-2xl text-muted-foreground"
              aria-hidden="true"
            />
            <h2 className="mt-3 text-base font-semibold text-foreground">
              {resolutionStatus === "denied"
                ? "Truy cập bị từ chối"
                : "Không thể tải bài viết"}
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {resolutionStatus === "denied"
                ? "Bạn không có quyền xem nội dung này."
                : "Dữ liệu bài viết hiện không khả dụng."}
            </p>
            {routeVisibility === "public" && (
              <a
                href={`/blog/post/${postId}`}
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none active:scale-98"
              >
                Mở trang bài viết
              </a>
            )}
          </div>
        </div>
      )}
    </ModalPostFrame>
  );
}
