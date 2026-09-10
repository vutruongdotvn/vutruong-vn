"use client";

import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { useWatchAccess } from "@/components/watch/access/WatchAccessProvider";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";
import type { WatchAccessState, WatchUserStatus } from "@/types/watchAccess";

type AccessView =
  | "checking"
  | "anonymous"
  | "pending"
  | "error"
  | "revoked"
  | "banned"
  | "rejected"
  | "unknown"
  | "approved"
  | "admin";

type AccessContent = {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
};

// Mỗi trạng thái là một khối riêng để có thể thay icon/text độc lập tại đây.
const CHECKING_CONTENT: AccessContent = {
  icon: "fa-user-shield",
  title: "Đang xác minh tài khoản",
  description: "Vui lòng chờ trong lúc kiểm tra tài khoản của bạn",
};

const ANONYMOUS_CONTENT: AccessContent = {
  icon: "fa-ban",
  title: "Truy cập bị từ chối",
  description: "Vui lòng đăng nhập để tiếp tục truy cập",
};

const PENDING_CONTENT: AccessContent = {
  icon: "fa-spinner-third motion-safe:animate-spin",
  title: "Tài khoản chưa được phê duyệt",
  description: "Tài khoản được phê duyệt mới có thể truy cập",
};

const ERROR_CONTENT: AccessContent = {
  icon: "fa-triangle-exclamation",
  title: "Chưa thể xác minh quyền",
  description: "Không thể kiểm tra quyền truy cập lúc này",
};

const REVOKED_CONTENT: AccessContent = {
  icon: "fa-shield-slash",
  title: "Quyền truy cập đã bị thu hồi",
  description: "Tài khoản hiện không còn quyền truy cập Watch",
};

const BANNED_CONTENT: AccessContent = {
  icon: "fa-ban",
  title: "Tài khoản đã bị khóa",
  description: "Tài khoản đang bị khóa và không thể truy cập Watch",
};

const REJECTED_CONTENT: AccessContent = {
  icon: "fa-circle-xmark",
  title: "Yêu cầu truy cập bị từ chối",
  description: "Yêu cầu phê duyệt tài khoản của bạn đã bị từ chối",
};

const UNKNOWN_CONTENT: AccessContent = {
  icon: "fa-circle-question",
  title: "Chưa xác định được trạng thái tài khoản",
  description: "Tài khoản chưa có trạng thái quyền Watch hợp lệ",
};

const APPROVED_CONTENT: AccessContent = {
  icon: "fa-shield-check",
  title: "Tài khoản đã được xác thực",
  description: "Bạn đã được phê duyệt và có quyền truy cập Watch",
};

const ADMIN_CONTENT: AccessContent = {
  icon: "fa-badge-check",
  title: "Đã xác thực quản trị viên",
  description: "Bạn có quyền quản trị và được phép truy cập Watch",
};

export const WATCH_ACCESS_CONTENT = {
  checking: CHECKING_CONTENT,
  anonymous: ANONYMOUS_CONTENT,
  pending: PENDING_CONTENT,
  error: ERROR_CONTENT,
  revoked: REVOKED_CONTENT,
  banned: BANNED_CONTENT,
  rejected: REJECTED_CONTENT,
  unknown: UNKNOWN_CONTENT,
  approved: APPROVED_CONTENT,
  admin: ADMIN_CONTENT,
} satisfies Record<AccessView, AccessContent>;

const STATUS_LABELS: Record<WatchUserStatus, string> = {
  approved: "Đã duyệt",
  pending: "Đang chờ duyệt",
  banned: "Tài khoản đã bị khóa",
  rejected: "Yêu cầu bị từ chối",
  revoked: "Quyền truy cập bị thu hồi",
  unknown: "Chưa xác định",
};

export function watchAccessView(access: WatchAccessState): AccessView {
  if (access.phase === "checking") return "checking";
  if (access.phase === "anonymous") return "anonymous";
  if (access.phase === "error") return "error";

  if (access.phase === "allowed") {
    if (!access.userId || access.status !== "approved") return "error";
    if (access.accessKind === "admin") return "admin";
    return access.accessKind === "approved_user" ? "approved" : "error";
  }

  switch (access.status) {
    case "pending":
      return "pending";
    case "revoked":
      return "revoked";
    case "banned":
      return "banned";
    case "rejected":
      return "rejected";
    default:
      return "unknown";
  }
}

function canMountWatch(access: WatchAccessState): boolean {
  return access.phase === "allowed"
    && Boolean(access.userId)
    && access.status === "approved"
    && (access.accessKind === "admin" || access.accessKind === "approved_user");
}

function WatchBlockedCard({ access, view }: { access: WatchAccessState; view: AccessView }) {
  const content = WATCH_ACCESS_CONTENT[view];
  const denied = access.phase === "denied";

  return (
    <main
      data-watch-guard="blocked"
      data-watch-access-state={view}
      aria-labelledby="watch-access-title"
      className="min-h-screen flex items-center justify-center text-center px-0 pb-28 pt-24 sm:px-4"
    >
      <PremiumGlassCard
        aria-labelledby="watch-access-title"
        className="max-w-3xl"
        contentClassName="text-center p-4 sm:p-8 py-8"
      >
        {/* Icon Container — giữ nguyên bố cục cá nhân hóa của WatchGuard. */}
        <div className="size-16 mb-6 flex items-center mx-auto justify-center rounded-full bg-red-50 dark:bg-red-400/15 border border-red-200 dark:border-red-400/25">
          <i
            aria-hidden="true"
            className={`fa-duotone ${content.icon} text-3xl text-red-500`}
          />
        </div>

        <h1
          id="watch-access-title"
          className="text-xl sm:text-2xl font-bold text-foreground mb-1.5"
        >
          {content.title}
        </h1>

        <p className="text-sm sm:text-base text-muted-foreground mb-6">
          {content.description}
        </p>

        {denied && (
          <p className="text-sm text-foreground border border-border py-2 px-6 inline-flex rounded-full bg-background/75">
            Trạng thái tài khoản: {STATUS_LABELS[access.status]}
          </p>
        )}

        {/* Nút điều hướng lối thoát */}
        <Link
          href="/"
          prefetch={false}
          className="flex items-center gap-3 justify-center mt-8 px-6 py-3 mx-auto bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition shadow-lg shadow-primary/20 active:scale-95 w-sm max-w-full"
        >
          <i aria-hidden="true" className="fad fa-arrow-left" />
          Về Trang chủ
        </Link>
      </PremiumGlassCard>
    </main>
  );
}

/**
 * Chặn toàn bộ cây Watch cho tới khi RPC xác nhận admin/approved user.
 * Mọi request phim vẫn phải gọi requireAccess() ngay trước khi fetch.
 */
export default function WatchGuard({ children }: { children: ReactNode }) {
  const access = useWatchAccess();
  const view = watchAccessView(access);

  if (!canMountWatch(access)) {
    return <WatchBlockedCard access={access} view={view} />;
  }

  // Không hiển thị card "thành công" để tránh nháy trước trang chủ Watch.
  // Screen reader vẫn nhận đúng trạng thái approved/admin.
  const content = WATCH_ACCESS_CONTENT[view];

  return (
    <Fragment key={`${access.userId}:${access.revision}`}>
      <span className="sr-only" role="status" data-watch-access-state={view}>
        <i aria-hidden="true" className={`fa-duotone ${content.icon}`} />
        {content.title}
      </span>
      {children}
    </Fragment>
  );
}
