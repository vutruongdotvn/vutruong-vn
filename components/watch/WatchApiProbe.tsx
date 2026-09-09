"use client";

import Link from "next/link";
import { isCancelledError, useIsFetching } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useWatchAccess } from "@/components/watch/access/WatchAccessProvider";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";
import { useWatchLatest } from "@/hooks/watch/useWatchLatest";
import { watchApiErrorMessage } from "@/types/watchApi";

/** B2 acceptance only: two real hook consumers of the SAME list query. */
export default function WatchApiProbe() {
  const access = useWatchAccess();
  const scope = useWatchQueryScope();
  const fetching = useIsFetching({ queryKey: scope.latestOptions(1).queryKey, exact: true });
  const [showA, setShowA] = useState(true);
  const [showB, setShowB] = useState(true);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("Hai vùng A/B cùng đọc trang 1. Mở Network để kiểm tra một GET dùng chung.");
  const action = useRef<object | null>(null);
  useEffect(() => () => { action.current = null; }, []);

  async function load(force: boolean) {
    if (action.current) return;
    const token = {};
    action.current = token;
    setPending(true);
    try {
      const data = await scope.loadLatest(1, force);
      if (action.current !== token) return;
      setMessage(force
        ? `Đã làm mới ${data.items.length} mục từ nguồn. Hai vùng nhận chung kết quả.`
        : `Đã đọc ${data.items.length} mục qua lớp query. Cache còn mới thì không phát thêm GET phim.`);
    } catch (error) {
      if (action.current !== token) return;
      setMessage(isCancelledError(error) ? "Đã hủy lượt tải chung." : watchApiErrorMessage(error));
    } finally {
      if (action.current === token) { action.current = null; setPending(false); }
    }
  }

  async function cancel() {
    // Query can resolve a cancelled refresh with its previous cached data.
    // Invalidate this UI action first so that it cannot report a fresh download.
    action.current = null;
    setPending(false);
    await scope.cancelLatest();
    // An accepted result can stay visible when only a refresh was cancelled.
    if (scope.getSnapshot().ready) setMessage("Đã hủy lượt tải chung; không tự gửi lại.");
  }

  const button = "inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50";
  return (
    <main data-watch-protected="b2" className="min-h-screen px-4 pb-28 pt-24 sm:px-6">
      <section className="mx-auto max-w-3xl rounded-2xl border border-border bg-card p-5 sm:p-8">
        <p className="mb-3 text-sm font-medium text-muted-foreground">VT Zone Watch · Kiểm tra bước B2</p>
        <h1 className="text-xl font-bold text-foreground sm:text-2xl">Dữ liệu dùng chung cho trang chủ</h1>
        <p className="mt-3 text-base leading-7 text-muted-foreground">
          Danh sách tự tải sau khi được cấp quyền. Hai vùng bên dưới dùng chung cache trong bộ nhớ browser.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">Quyền hiện tại: <strong className="text-foreground">
          {access.accessKind === "admin" ? "Admin" : "User approved"}
        </strong></p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button type="button" disabled={pending || fetching > 0} onClick={() => void load(false)} className={`${button} bg-primary text-primary-foreground`}>Đọc lại qua cache</button>
          <button type="button" disabled={pending || fetching > 0} onClick={() => void load(true)} className={`${button} border border-border`}>Làm mới từ nguồn</button>
          {fetching > 0 && <button type="button" onClick={() => void cancel()} className={`${button} border border-border`}>Hủy lượt tải chung</button>}
        </div>
        <p role="status" aria-live="polite" className="mt-4 text-sm leading-6 text-muted-foreground">{message}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" aria-pressed={showA} onClick={() => setShowA(value => !value)} className={`${button} border border-border`}>{showA ? "Ẩn vùng A" : "Hiện vùng A"}</button>
          <button type="button" aria-pressed={showB} onClick={() => setShowB(value => !value)} className={`${button} border border-border`}>{showB ? "Ẩn vùng B" : "Hiện vùng B"}</button>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          {showA && <ProbeRegion label="A" />}
          {showB && <ProbeRegion label="B" />}
        </div>
        {!showA && !showB && <p className="mt-5 text-sm leading-6 text-muted-foreground">Cả hai vùng đã được gỡ. Hiện lại để kiểm tra dùng lại cache trong cùng phiên Watch.</p>}
        <p className="mt-6 text-sm leading-6 text-muted-foreground">
          Cache danh sách còn mới trong 5 phút. Đổi tab không tự tải lại phim. Đăng xuất, mất quyền hoặc rời Watch sẽ bỏ cache của phạm vi này.
        </p>
        <Link href="/" prefetch={false} className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-medium">
          <i aria-hidden="true" className="fad fa-arrow-left" /> Về VT Zone
        </Link>
      </section>
    </main>
  );
}

/** Local diagnostic region, not a production MovieCard or an extra request source. */
function ProbeRegion({ label }: { label: string }) {
  const query = useWatchLatest(1);
  return (
    <div data-watch-query-region={label} className="rounded-xl border border-border p-4">
      <h2 className="font-semibold">Vùng {label}</h2>
      <p role="status" aria-live="polite" className="mt-2 text-sm text-muted-foreground">
        {query.isFetching ? "Đang tải danh sách…" : query.isError ? "Chưa tải được dữ liệu mới." : query.data ? "Đã có dữ liệu." : "Chưa có dữ liệu. Bấm Làm mới từ nguồn để tải."}
      </p>
      {query.isError && <p className="mt-3 text-sm leading-6">{watchApiErrorMessage(query.error)}</p>}
      {query.data && <>
        <p className="mt-3 text-xs leading-6 text-muted-foreground">{query.data.items.length} mục · Trang {query.data.pagination.currentPage}/{query.data.pagination.totalPages}</p>
        <p className="text-xs leading-6 text-muted-foreground">Cập nhật: <time>{new Date(query.dataUpdatedAt).toLocaleTimeString("vi-VN")}</time></p>
        <ol className="mt-3 divide-y divide-border">
          {query.data.items.slice(0, 3).map((item, index) => <li key={index} className="py-3">
            <p className="break-words text-sm font-medium">{item.name ?? `Mục ${index + 1}: chưa có tên`}</p>
            {item.slug && <p className="mt-1 break-all text-xs text-muted-foreground">{item.slug}</p>}
          </li>)}
        </ol>
      </>}
    </div>
  );
}
