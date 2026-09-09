"use client";

import Link from "next/link";
import { Fragment, useState, type ReactNode } from "react";
import { useWatchAccess } from "@/components/watch/access/WatchAccessProvider";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";

const blockedContent = {
  checking: {
    title: "Đang xác minh tài khoản",
    description: "Vui lòng chờ trong lúc kiểm tra tài khoản của bạn",
  },
  anonymous: {
    title: "Truy cập bị từ chối",
    description: "Vui lòng đăng nhập để tiếp tục truy cập",
  },
  denied: {
    title: "Tài khoản chưa được phê duyệt",
    description: "Tài khoản được phê duyệt mới có thể truy cập",
  },
  error: {
    title: "Chưa thể xác minh quyền",
    description: "Không thể kiểm tra quyền truy cập lúc này",
  },
};

const statusLabels = {
  approved: "Đã duyệt", pending: "Đang chờ duyệt", banned: "Tài khoản đã bị khóa",
  rejected: "Yêu cầu bị từ chối", revoked: "Quyền truy cập bị thu hồi", unknown: "Chưa xác định",
};

/**
 * Gates rendering and mounting of the browser-owned Watch subtree.
 * Movie modules must stay free of import-time/server-side requests. Each future
 * movie request must also acquire a permit through requireAccess() (step B).
 */
export default function WatchGuard({ children }: { children: ReactNode }) {
  const access = useWatchAccess();
  const [manualCheckPending, setManualCheckPending] = useState(false);
  const canMount = access.phase === "allowed" && Boolean(access.userId)
    && access.status === "approved"
    && (access.accessKind === "admin" || access.accessKind === "approved_user");
  const showChecking = access.phase === "checking" || manualCheckPending;

  async function handleRecheck() {
    if (showChecking) return;
    setManualCheckPending(true);
    try {
      // The provider owns verification, including deduplication and cancellation.
      await access.recheck();
    } finally {
      setManualCheckPending(false);
    }
  }

  if (canMount) {
    // Same-account background verification keeps the mounted subtree stable.
    // A new identity or permission revision discards the previous subtree state.
    return <Fragment key={`${access.userId}:${access.revision}`}>{children}</Fragment>;
  }

  // An inconsistent "allowed" snapshot must still fail closed.
  const phase = access.phase === "allowed" ? "error" : access.phase;
  const content = blockedContent[phase];

  return (
    <main data-watch-guard="blocked" className="min-h-screen flex items-center justify-center text-center px-4 pb-28 pt-24 sm:px-6">
      <PremiumGlassCard aria-labelledby="watch-access-title" className="max-w-3xl" contentClassName="text-center p-4 sm:p-8 py-8">

        {/* Icon Container */}
        <div className="size-16 mb-6 flex items-center mx-auto justify-center rounded-full bg-red-50 dark:bg-red-400/15 border border-red-200 dark:border-red-400/25">
          <i className="fa-duotone fa-lock-keyhole text-3xl text-red-500" />
        </div>

        <h1 id="watch-access-title" className="text-xl sm:text-2xl font-bold text-foreground mb-1.5">
          {content.title}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground mb-6">{content.description}</p>

        {phase === "denied" && (
          <p className="text-sm text-foreground border border-border py-2 px-6 inline-flex rounded-full bg-background/75">Trạng thái tài khoản: {statusLabels[access.status]}</p>
        )}

        {/* <div aria-live="polite" className="mb-5 mt-6 min-h-7 text-sm leading-6 text-muted-foreground">
          {showChecking ? "Đang kiểm tra quyền truy cập của tài khoản..." : "Bạn có thể kiểm tra lại sau khi trạng thái tài khoản thay đổi."}
        </div> */}
        {/* <div className="flex items-center justify-center flex-wrap items-center gap-3">
          <button type="button" onClick={() => { void handleRecheck(); }} disabled={showChecking} aria-busy={showChecking}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-wait disabled:opacity-50">
            <i aria-hidden="true" className="fad fa-arrows-rotate" /> Kiểm tra lại quyền
          </button>
          <Link href="/" prefetch={false} className="inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Về Trang chủ</Link>
        </div> */}

        {/* Nút điều hướng lối thoát */}
        <Link href="/" className="flex items-center gap-3 justify-center mt-6 px-6 py-3 mx-auto bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-95 w-sm max-w-full">
          <i className="fad fa-arrow-left" /> Về Trang chủ
        </Link>

      </PremiumGlassCard>
    </main>
  );
}
