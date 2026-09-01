"use client";

import {
  type ReactNode,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
} from "react";

type ModalLayout = "media" | "text";

type ModalPostFrameProps = {
  onClose: () => void;
  layout?: ModalLayout;
  busy?: boolean;
  title?: string;
  children: ReactNode;
};

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "iframe",
  "[tabindex]:not([tabindex='-1'])",
].join(",");

type ModalEnvironment = {
  holders: number;
  startedAt: number;
  activeElement: HTMLElement | null;
  htmlOverflow: string;
  htmlOverflowPriority: string;
  bodyOverflow: string;
  bodyOverflowPriority: string;
  blogRoot: HTMLElement | null;
  blogWasInert: boolean;
};

// Chỉ giữ trạng thái UI của modal đang mở, không chứa bài viết/user/session.
// Loading boundary và page là hai cây React khác nhau: dùng chung lease để
// bàn giao scroll lock/focus mà không mở khóa trang nền ở giữa hai cây.
let modalEnvironment: ModalEnvironment | null = null;

function acquireModalEnvironment() {
  if (!modalEnvironment) {
    const blogRoot = document.getElementById("blog");
    modalEnvironment = {
      holders: 0,
      startedAt: performance.now(),
      activeElement:
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null,
      htmlOverflow: document.documentElement.style.overflow,
      htmlOverflowPriority:
        document.documentElement.style.getPropertyPriority("overflow"),
      bodyOverflow: document.body.style.overflow,
      bodyOverflowPriority: document.body.style.getPropertyPriority("overflow"),
      blogRoot,
      blogWasInert: blogRoot?.hasAttribute("inert") ?? false,
    };
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    blogRoot?.setAttribute("inert", "");
  }

  const environment = modalEnvironment;
  environment.holders += 1;
  let released = false;

  return {
    startedAt: environment.startedAt,
    release() {
      if (released) return;
      released = true;
      environment.holders -= 1;

      // Đợi hết commit hiện tại, không thêm frame chờ hay delay cho dữ liệu.
      // Nếu frame tiếp theo đã nhận lease thì đây chỉ là bàn giao UI.
      queueMicrotask(() => {
        if (modalEnvironment !== environment || environment.holders !== 0)
          return;

        document.documentElement.style.setProperty(
          "overflow",
          environment.htmlOverflow,
          environment.htmlOverflowPriority,
        );
        document.body.style.setProperty(
          "overflow",
          environment.bodyOverflow,
          environment.bodyOverflowPriority,
        );
        if (environment.blogRoot && !environment.blogWasInert) {
          environment.blogRoot.removeAttribute("inert");
        }
        modalEnvironment = null;

        const previous = environment.activeElement;
        if (previous?.isConnected && !previous.closest("[inert]")) {
          previous.focus({ preventScroll: true });
        }
      });
    },
  };
}

// Khung duy nhất cho route skeleton, public, privacy và thông báo từ chối.
// Khi chưa có dữ liệu, CSS đọc hint text/media sẵn có mà không chờ effect.
export function ModalPostFrame({
  onClose,
  layout,
  busy = false,
  title,
  children,
}: ModalPostFrameProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const isClosingRef = useRef(false);
  const close = useCallback(() => {
    if (isClosingRef.current) return;
    isClosingRef.current = true;
    onClose();
  }, [onClose]);

  useLayoutEffect(() => {
    const lease = acquireModalEnvironment();
    // Giữ cùng nhịp pulse khi loading boundary được thay bằng page skeleton.
    dialogRef.current?.style.setProperty(
      "--modal-pulse-delay",
      `-${(performance.now() - lease.startedAt) % 2000}ms`,
    );
    closeButtonRef.current?.focus({ preventScroll: true });

    const handleKeyDown = (event: KeyboardEvent) => {
      const dialog = dialogRef.current;
      if (event.defaultPrevented || !dialog?.getClientRects().length) return;

      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter(
        (element) =>
          element.getClientRects().length > 0 &&
          !element.hasAttribute("disabled") &&
          element.getAttribute("aria-hidden") !== "true" &&
          !element.closest("[inert]"),
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (!first || !last) {
        event.preventDefault();
        closeButtonRef.current?.focus({ preventScroll: true });
      } else if (!dialog.contains(active)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus({ preventScroll: true });
      } else if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      lease.release();
    };
  }, [close]);

  return (
    <div className="fixed inset-0 z-[9998] flex items-center justify-center">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/35 backdrop-blur-xs"
        onClick={close}
      />

      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-busy={busy || undefined}
        data-layout={layout ?? "auto"}
        className="modal-post-frame relative z-10 min-h-0 overflow-hidden bg-white"
      >
        <h1 id={titleId} className="sr-only">
          {title || (busy ? "Đang tải bài viết" : "Bài viết")}
        </h1>
        <button
          ref={closeButtonRef}
          type="button"
          onClick={close}
          aria-label="Đóng bài viết"
          className="absolute right-3 top-3 z-30 inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-500 shadow-sm backdrop-blur-sm hover:bg-slate-100 hover:text-slate-950 hover:shadow-md focus-visible:outline-none active:scale-95"
        >
          <i className="fa-duotone fa-xmark" aria-hidden="true" />
        </button>
        {children}
      </section>

      <style jsx global>{`
        .modal-post-frame {
          display: grid;
          width: 100%;
          height: 100%;
          grid-template-rows: minmax(0, 55%) minmax(0, 45%);
        }

        .modal-post-frame .animate-pulse {
          animation-delay: var(--modal-pulse-delay, 0ms);
        }

        .modal-post-skeleton-extra {
          display: none;
        }

        .modal-post-frame[data-layout="text"],
        html[data-modal-loading-kind="text"]
          .modal-post-frame[data-layout="auto"] {
          display: flex;
          flex-direction: column;
          height: auto;
          max-height: 100dvh;
          max-width: 42rem;
        }

        .modal-post-frame[data-layout="text"] .modal-post-skeleton-media,
        html[data-modal-loading-kind="text"]
          .modal-post-frame[data-layout="auto"]
          .modal-post-skeleton-media {
          display: none;
        }

        .modal-post-frame[data-layout="text"] .modal-post-skeleton-extra,
        html[data-modal-loading-kind="text"]
          .modal-post-frame[data-layout="auto"]
          .modal-post-skeleton-extra {
          display: block;
        }

        @media (min-width: 640px) {
          .modal-post-frame[data-layout="text"],
          html[data-modal-loading-kind="text"]
            .modal-post-frame[data-layout="auto"] {
            width: min(80vw, 44rem);
            border-radius: 1rem;
          }
        }

        @media (min-width: 1024px) {
          .modal-post-frame {
            grid-template-columns: minmax(0, 8fr) minmax(15rem, 2fr);
            grid-template-rows: minmax(0, 1fr);
          }

          .modal-post-frame[data-layout="text"],
          html[data-modal-loading-kind="text"]
            .modal-post-frame[data-layout="auto"] {
            max-height: 80dvh;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .modal-post-frame .animate-pulse {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}

// Cùng một nội dung skeleton cho public/privacy; chỉ bố cục text/media khác.
// Không đặt spinner ở đây: ảnh tải chậm có spinner riêng trong ModalPostMedia.
export function ModalPostSkeletonContent() {
  return (
    <>
      <div
        aria-hidden="true"
        className="modal-post-skeleton-media relative min-h-0 overflow-hidden bg-black/50"
      />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
        <div className="flex shrink-0 items-center gap-2 p-3 pr-14 sm:p-4 sm:pr-16">
          <div className="h-[30px] w-[30px] shrink-0 animate-pulse rounded-full bg-slate-200" />
          <div className="min-w-0 flex-1 space-y-2">
            <div className="h-3.5 w-33 animate-pulse rounded-full bg-slate-200" />
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden px-4 py-1">
          <span role="status" className="sr-only">
            Đang tải nội dung bài viết
          </span>
          <div className="space-y-3" aria-hidden="true">
            <div className="h-3.5 w-full animate-pulse rounded-full bg-slate-200" />
            <div className="h-3.5 w-11/12 animate-pulse rounded-full bg-slate-200" />
            <div className="h-3.5 w-4/5 animate-pulse rounded-full bg-slate-200" />
            <div className="modal-post-skeleton-extra space-y-3 py-3">
              <div className="h-3.5 w-full animate-pulse rounded-full bg-slate-100" />
              <div className="h-3.5 w-8/12 animate-pulse rounded-full bg-slate-100" />
              <div className="h-3.5 w-6/12 animate-pulse rounded-full bg-slate-100" />
            </div>
          </div>

          {/* <div className="flex items-center justify-start gap-4">
            <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
            <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
            <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
          </div> */}
        </div>
        {/* <div
          className="flex shrink-0 items-center gap-5 border-t border-slate-100 bg-white px-4 py-3"
          aria-hidden="true"
        >
          <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
          <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
          <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
        </div> */}
      </div>
    </>
  );
}

export default function ModalFullPostSkeleton({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <ModalPostFrame onClose={onClose} busy>
      <ModalPostSkeletonContent />
    </ModalPostFrame>
  );
}
