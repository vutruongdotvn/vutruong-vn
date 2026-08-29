"use client";

import {
  type RefObject,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { useRouter } from "next/navigation";

function HeaderSkeleton() {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-slate-100 p-3 pr-14 sm:p-4 sm:pr-16">
      <div className="h-9 w-9 shrink-0 animate-pulse rounded-full bg-slate-200" />
      <div className="min-w-0 flex-1 space-y-2">
        <div className="h-3.5 w-24 animate-pulse rounded-full bg-slate-200" />
        <div className="h-2.5 w-16 animate-pulse rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

function BodySkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className="min-h-0 flex-1 overflow-hidden px-4 py-4">
      <span className="sr-only">Đang tải nội dung bài viết</span>
      <div className="space-y-3" aria-hidden="true">
        <div className="h-3.5 w-full animate-pulse rounded-full bg-slate-200" />
        <div className="h-3.5 w-11/12 animate-pulse rounded-full bg-slate-200" />
        <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-slate-200" />

        {!compact && (
          <>
            <div className="pt-3">
              <div className="h-3.5 w-full animate-pulse rounded-full bg-slate-100" />
            </div>
            <div className="h-3.5 w-10/12 animate-pulse rounded-full bg-slate-100" />
          </>
        )}

        {/* <div className="mt-5 flex items-center gap-3 border-t border-slate-100 pt-4">
          <div className="h-4 w-4 shrink-0 animate-pulse rounded-full bg-slate-100" />
          <div className="h-3 w-48 max-w-[70%] animate-pulse rounded-full bg-slate-100" />
        </div> */}
      </div>
    </div>
  );
}

function ActionsSkeleton() {
  return (
    <div
      className="flex shrink-0 items-center gap-5 border-t border-slate-100 bg-white px-4 py-3"
      aria-hidden="true"
    >
      <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
      <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
      <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
    </div>
  );
}

type CloseButtonProps = {
  buttonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
};

function CloseButton({ buttonRef, onClose }: CloseButtonProps) {
  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClose}
      aria-label="Đóng bài viết"
      className="absolute right-3 top-3 z-30 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur-sm hover:bg-slate-100 hover:text-slate-950 hover:shadow-md focus-visible:outline-none active:scale-95"
    >
      <i className="fa-duotone fa-xmark" aria-hidden="true" />
    </button>
  );
}

export default function InterceptedPostLoading() {
  const router = useRouter();
  const mediaCloseButtonRef = useRef<HTMLButtonElement>(null);
  const textCloseButtonRef = useRef<HTMLButtonElement>(null);
  const isClosingRef = useRef(false);

  const closeModal = useCallback(() => {
    if (isClosingRef.current) return;

    isClosingRef.current = true;
    router.back();
  }, [router]);

  const getVisibleCloseButton = useCallback(() => {
    return document.documentElement.dataset.modalLoadingKind === "text"
      ? textCloseButtonRef.current
      : mediaCloseButtonRef.current;
  }, []);

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

    const focusFrame = window.requestAnimationFrame(() => {
      getVisibleCloseButton()?.focus();
    });

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        getVisibleCloseButton()?.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", handleKeyDown);
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousBodyOverflow;

      if (blogRoot && !blogWasInert) {
        blogRoot.removeAttribute("inert");
      }

      previousActiveElement?.focus();
    };
  }, [closeModal, getVisibleCloseButton]);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/35 backdrop-blur-xs"
        onClick={closeModal}
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Đang mở bài viết có hình ảnh"
        aria-busy="true"
        aria-live="polite"
        className="modal-loading-media relative z-10 grid h-full w-full min-h-0 grid-rows-[minmax(0,50%)_minmax(0,50%)] overflow-hidden bg-white lg:grid-cols-[minmax(0,7.5fr)_minmax(15rem,2.5fr)] lg:grid-rows-1"
      >
        <CloseButton
          buttonRef={mediaCloseButtonRef}
          onClose={closeModal}
        />

        <div className="relative min-h-0 overflow-hidden bg-black/90 flex items-center justify-center">
          {/* <div className="absolute inset-[12%] animate-pulse rounded-xl bg-white/[0.07]" /> */}
          <i className="fad fa-spin fa-spinner-third flex fa-2x text-slate-600" />
        </div>

        <div className="flex min-h-0 min-w-0 flex-col bg-white">
          <HeaderSkeleton />
          <BodySkeleton compact />
          <ActionsSkeleton />
        </div>
      </section>

      <section
        role="dialog"
        aria-modal="true"
        aria-label="Đang mở bài viết chỉ có nội dung"
        aria-busy="true"
        aria-live="polite"
        className="modal-loading-text relative z-10 flex max-h-[100dvh] w-full max-w-2xl min-h-0 flex-col overflow-hidden bg-white sm:w-[min(80vw,44rem)] sm:rounded-2xl lg:max-h-[80dvh]"
      >
        <CloseButton buttonRef={textCloseButtonRef} onClose={closeModal} />

        <HeaderSkeleton />
        <BodySkeleton />
        <ActionsSkeleton />
      </section>

      <style jsx global>{`
        html[data-modal-loading-kind="text"] .modal-loading-media {
          display: none;
        }

        html:not([data-modal-loading-kind="text"]) .modal-loading-text {
          display: none;
        }
      `}</style>
    </div>
  );
}
