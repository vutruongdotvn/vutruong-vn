"use client";

import Link from "next/link";
import { useState } from "react";
import { useWatchAccess } from "@/components/watch/access/WatchAccessProvider";

const phaseLabels = {
  checking: "Đang xác minh quyền", anonymous: "Chưa xác thực đăng nhập",
  allowed: "Đã xác minh: được phép truy cập", denied: "Tài khoản chưa được cấp quyền", error: "Chưa thể xác minh quyền",
};

/** Temporary A1 acceptance screen. No movie subtree or movie request exists yet. */
export default function WatchAccessCheckPage() {
  const access = useWatchAccess();
  const [manualCheckPending, setManualCheckPending] = useState(false);
  const allowed = access.phase === "allowed";
  // Background verification still runs in the provider. Show loading only for
  // an unresolved identity/decision or an explicit click, keeping tab returns quiet.
  const showChecking = access.phase === "checking" || manualCheckPending;

  async function handleRecheck() {
    if (showChecking) return;
    setManualCheckPending(true);
    try {
      // Join any verification already in flight through the existing controller.
      await access.recheck();
    } finally {
      setManualCheckPending(false);
    }
  }

  return (
    <main className="min-h-screen px-4 pb-28 pt-24 sm:px-6">
      <section className="mx-auto max-w-2xl rounded-2xl border border-border bg-card p-5 sm:p-8">
        <p className="mb-3 text-sm font-medium text-muted-foreground">VT Zone Watch · Kiểm tra bước A1</p>
        <h1 className="flex items-start gap-3 text-xl font-bold text-foreground sm:text-2xl">
          <i aria-hidden="true" className={`fad ${allowed ? "fa-shield-check" : "fa-shield-keyhole"} mt-1`} />
          {phaseLabels[access.phase]}
        </h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Đây là màn hình kiểm tra quyền. Dữ liệu và trình phát phim sẽ được tích hợp ở các bước sau.
        </p>
        {access.phase === "anonymous" && (
          <p className="mt-3 text-base text-foreground">Bạn có thể đăng nhập bằng menu tài khoản trên thanh điều hướng.</p>
        )}
        <dl className="my-6 divide-y divide-border text-sm sm:text-base">
          <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Quyền đã xác minh</dt><dd className="text-right font-medium">{access.accessKind === "admin" ? "Admin" : access.accessKind === "approved_user" ? "User approved" : "Chưa được phép"}</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Trạng thái hiệu lực</dt><dd className="font-medium">{access.status}</dd></div>
          <div className="flex justify-between gap-4 py-3"><dt className="text-muted-foreground">Xác minh gần nhất</dt><dd className="text-right">{access.checkedAt ? new Date(access.checkedAt).toLocaleTimeString("vi-VN") : "Chưa có"}</dd></div>
        </dl>
        <div aria-live="polite" className="mb-5 min-h-7 text-sm leading-6">
          {access.error ? <p role="alert" className="text-destructive">{access.error}</p>
            : showChecking ? <p className="text-muted-foreground">Đang kiểm tra với Supabase…</p>
              : <p className="text-muted-foreground">Bạn có thể kiểm tra lại sau khi thay đổi trạng thái tài khoản.</p>}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => { void handleRecheck(); }} disabled={showChecking} aria-busy={showChecking}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity disabled:cursor-wait disabled:opacity-50">
            <i aria-hidden="true" className="fad fa-arrows-rotate" /> Kiểm tra lại quyền
          </button>
          <Link href="/" prefetch={false} className="inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-medium text-foreground hover:bg-muted">Về VT Zone</Link>
        </div>
      </section>
    </main>
  );
}
