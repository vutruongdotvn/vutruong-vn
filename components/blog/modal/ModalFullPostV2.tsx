"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import PostBody from "@/components/blog/PostBody";
import ModalPostHeader from "@/components/blog/modal/ModalPostHeader";
import ModalPostMedia from "@/components/blog/modal/ModalPostMedia";

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
  const hasMedia = !!post?.images.length;

  const closeModal = useCallback(() => {
    if (isClosingRef.current) return;

    isClosingRef.current = true;
    router.back();
  }, [router]);

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
  }, [closeModal]);

  const modalSizeClass = hasMedia
    ? "grid h-[min(92svh,900px)] w-[calc(100vw-1rem)] grid-rows-[minmax(0,45%)_minmax(0,55%)] sm:h-[min(88svh,900px)] sm:w-[calc(100vw-2rem)] lg:h-[80vh] lg:w-[80vw] lg:grid-cols-[minmax(0,7fr)_minmax(15rem,3fr)] lg:grid-rows-1"
    : "flex h-[min(80vh,760px)] w-[calc(100vw-1rem)] max-w-2xl sm:w-[min(80vw,44rem)]";

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-2 sm:p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/35 backdrop-blur-sm"
        onClick={closeModal}
      />

      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-full-post-v2-title"
        className={`animate-fadeIn relative z-10 min-h-0 overflow-hidden rounded-2xl bg-white shadow-[0_24px_70px_rgba(0,0,0,0.24)] ${modalSizeClass}`}
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

        {post ? (
          <>
            {hasMedia && (
              <ModalPostMedia
                key={post.id}
                images={post.images}
                postTitle={documentTitle}
              />
            )}

            <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
              <div className="shrink-0 border-b border-slate-100">
                <ModalPostHeader
                  name={post.author.name}
                  avatar={post.author.avatar}
                  createdAt={post.createdAt}
                />
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain py-4">
                <PostBody
                  content={post.content}
                  images={[]}
                  postId={post.id}
                  truncate={false}
                />
              </div>
            </div>
          </>
        ) : (
          <div className="flex min-h-0 flex-1 items-center justify-center px-6 py-16 text-center">
            <div className="max-w-sm">
              <i
                className="fa-duotone fa-lock-keyhole text-2xl text-slate-400"
                aria-hidden="true"
              />
              <h2 className="mt-3 text-base font-semibold text-slate-800">
                {routeVisibility === "privacy"
                  ? "Bài viết riêng tư"
                  : "Không thể tải bài viết"}
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                {routeVisibility === "privacy"
                  ? "Nội dung cần được xác thực trên trang bài viết đầy đủ."
                  : "Dữ liệu bài viết hiện không khả dụng."}
              </p>
              <a
                href={`/blog/post/${postId}`}
                className="mt-5 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-none active:scale-98"
              >
                Mở trang bài viết
              </a>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
