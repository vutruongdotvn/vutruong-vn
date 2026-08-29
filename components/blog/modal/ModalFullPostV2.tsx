"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

type ModalFullPostV2Props = {
  postId: string;
  documentTitle: string;
};

export default function ModalFullPostV2({
  postId,
  documentTitle,
}: ModalFullPostV2Props) {
  const router = useRouter();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isClosingRef = useRef(false);

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
    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousBodyOverflow = document.body.style.overflow;

    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;

      event.preventDefault();
      closeModal();
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [closeModal]);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-4">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/45"
        onClick={closeModal}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-full-post-v2-title"
        aria-describedby="modal-full-post-v2-description"
        className="relative z-10 w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1
              id="modal-full-post-v2-title"
              className="text-base font-semibold text-slate-900"
            >
              ModalFullPost v2
            </h1>
            <p
              id="modal-full-post-v2-description"
              className="mt-1 text-sm text-slate-500"
            >
              Intercepting Route đã hoạt động.
            </p>
          </div>

          <button
            ref={closeButtonRef}
            type="button"
            onClick={closeModal}
            aria-label="Đóng bài viết"
            className="inline-flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <i className="fa-duotone fa-xmark" aria-hidden="true" />
          </button>
        </div>

        <dl className="mt-5 rounded-xl bg-slate-50 p-4 text-sm">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <dt className="font-medium text-slate-700">Post ID:</dt>
            <dd className="break-all text-slate-600">{postId}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
