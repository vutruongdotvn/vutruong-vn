"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import PostBody from "@/components/blog/PostBody";
import PostActions from "@/components/blog/PostActions";
import ModalPostHeader from "@/components/blog/modal/ModalPostHeader";
import ModalPostMedia from "@/components/blog/modal/ModalPostMedia";
import ModalFullPostSkeleton from "@/components/blog/modal/ModalFullPostSkeleton";
import { extractPostDescription, extractPostTitle } from "@/lib/postMeta";
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
  | "checking"
  | "granted"
  | "denied"
  | "unavailable";

type PrivateResolution = {
  postId: string;
  status: PrivateResolutionStatus;
  post: ModalFullPostData | null;
};

type ModalFullPostV2Props = {
  postId: string;
  routeVisibility: "public" | "privacy";
  post: ModalFullPostData | null;
  documentTitle: string;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "iframe",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

function getOptionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getPostImages(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter(
      (image): image is string =>
        typeof image === "string" && image.trim().length > 0
    )
    .map((image) => image.trim());
}

function createPrivateModalPostData(
  post: PrivatePostRecord,
  profile: PrivatePostProfile | null
): ModalFullPostData | null {
  const createdAt = getOptionalString(post.created_at);

  if (!createdAt) return null;

  return {
    id: post.id,
    content: typeof post.content === "string" ? post.content : "",
    images: getPostImages(post.images),
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
  routeVisibility,
  post,
  documentTitle,
}: ModalFullPostV2Props) {
  const router = useRouter();
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isClosingRef = useRef(false);
  const [privateResolution, setPrivateResolution] =
    useState<PrivateResolution>(() => ({
      postId,
      status:
        post !== null
          ? "granted"
          : routeVisibility === "privacy"
            ? "checking"
            : "unavailable",
      post: null,
    }));

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
  const activePost = post ?? resolvedPrivatePost;
  const hasMedia = !!activePost?.images.length;
  const postTitle = activePost
    ? extractPostTitle(activePost.content) || documentTitle
    : documentTitle;
  const postDescription = activePost
    ? extractPostDescription(activePost.content)
    : undefined;

  const closeModal = useCallback(() => {
    if (isClosingRef.current) return;

    isClosingRef.current = true;
    router.back();
  }, [router]);

  useEffect(() => {
    // Public post tiếp tục dùng dữ liệu server. Chỉ privacy post chưa có dữ
    // liệu mới cần xác minh session và query lại bằng JWT ở browser.
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

      const modalPost = createPrivateModalPostData(
        result.post,
        result.profile
      );

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
    const nextTitle = documentTitle.trim();

    if (nextTitle) {
      document.title = nextTitle;
    }

    return () => {
      document.title = previousTitle;
    };
  }, [documentTitle]);

  useEffect(() => {
    // Trong lúc kiểm tra bài riêng tư, skeleton dùng chung tự quản lý focus,
    // Escape và scroll lock. Tránh hai dialog cùng gắn listener gây nháy UI.
    if (privateStatus === "checking") return;

    const previousActiveElement =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;
    const blogRoot = document.getElementById("blog");
    const blogWasInert = blogRoot?.hasAttribute("inert") ?? false;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    blogRoot?.setAttribute("inert", "");
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab") return;

      const dialog = dialogRef.current;
      if (!dialog) return;

      const focusableElements = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
      ).filter(
        (element) =>
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true"
      );

      if (focusableElements.length === 0) {
        event.preventDefault();
        closeButtonRef.current?.focus();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement;

      if (event.shiftKey && activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;

      if (blogRoot && !blogWasInert) {
        blogRoot.removeAttribute("inert");
      }

      previousActiveElement?.focus();
    };
  }, [closeModal, privateStatus]);

  // Giữ nguyên đúng một giao diện từ loading boundary đến hết bước xác thực.
  // Chỉ thay skeleton một lần khi bài viết thật hoặc kết quả từ chối đã có.
  if (privateStatus === "checking" && !activePost) {
    return <ModalFullPostSkeleton onClose={closeModal} />;
  }

  const modalSizeClass = hasMedia
    ? "grid h-full w-full grid-rows-[minmax(0,50%)_minmax(0,50%)] lg:grid-cols-[minmax(0,8fr)_minmax(15rem,2fr)] lg:grid-rows-1"
    : "flex max-h-[100dvh] w-full max-w-2xl sm:w-[min(80vw,44rem)] sm:rounded-2xl lg:max-h-[80dvh]";

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/35 backdrop-blur-xs"
        onClick={closeModal}
      />

      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-full-post-v2-title"
        className={`relative z-10 min-h-0 overflow-hidden bg-white ${modalSizeClass}`}
      >
        <h1 id="modal-full-post-v2-title" className="sr-only">
          {documentTitle}
        </h1>

        <button
          ref={closeButtonRef}
          type="button"
          onClick={closeModal}
          aria-label="Đóng bài viết"
          className="absolute right-3 top-3 z-30 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur-sm hover:bg-slate-100 hover:text-slate-950 hover:shadow-md focus-visible:outline-none active:scale-95"
        >
          <i className="fa-duotone fa-xmark" aria-hidden="true" />
        </button>

        {activePost ? (
          <>
            {hasMedia && (
              <ModalPostMedia
                key={activePost.id}
                images={activePost.images}
                postTitle={postTitle}
              />
            )}

            <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
              <div className="shrink-0 border-b border-slate-100">
                <ModalPostHeader
                  name={activePost.author.name}
                  avatar={activePost.author.avatar}
                  createdAt={activePost.createdAt}
                  visibility={routeVisibility}
                />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4">
                <PostBody
                  content={activePost.content}
                  images={[]}
                  postId={activePost.id}
                  truncate={false}
                />
                {/* <div className="mt-3 flex select-none items-center gap-3 border-t border-slate-100 p-3 text-[.9375rem] text-slate-400 sm:mt-4 sm:p-4">
                  <i
                    className="fadt fa-comment-slash"
                    aria-hidden="true"
                  />
                  <span>Không cho phép đăng bình luận mới.</span>
                </div> */}
              </div>

              <div className="shrink-0 border-t border-slate-100 bg-white">
                <PostActions
                  postId={activePost.id}
                  postTitle={postTitle}
                  postDescription={postDescription}
                />
              </div>
            </div>
          </>
        ) : (
          <div
            aria-live="polite"
            className="flex min-h-0 flex-1 items-center justify-center px-6 py-16 text-center"
          >
            <div className="max-w-sm">
              <i
                className="fa-duotone fa-lock-keyhole text-2xl text-slate-400"
                aria-hidden="true"
              />
              <h2 className="mt-3 text-base font-semibold text-slate-800">
                {privateStatus === "denied"
                  ? "Truy cập bị từ chối"
                  : "Không thể tải bài viết"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {privateStatus === "denied"
                  ? "Bạn không có quyền xem nội dung này."
                  : "Dữ liệu bài viết hiện không khả dụng."}
              </p>
              {routeVisibility === "public" && (
                <a
                  href={`/blog/post/${postId}`}
                  className="mt-5 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-none active:scale-98"
                >
                  Mở trang bài viết
                </a>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
