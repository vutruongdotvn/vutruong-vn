"use client";

import Link from "next/link";
import WatchProtectedMetadata from "@/components/watch/WatchProtectedMetadata";
import { useEffect, useMemo, useRef, useState } from "react";
import WatchGrid from "@/components/watch/WatchGrid";
import WatchBrowseGridSkeleton from "@/components/watch/browse/WatchBrowseGridSkeleton";
import WatchPagination from "@/components/watch/browse/WatchPagination";
import { useWatchCollectionPage } from "@/hooks/watch/useWatchCollectionPage";
import { watchCollectionMovies } from "@/lib/watch/watchCollectionView";
import { watchApiErrorMessage, type WatchCollectionSource } from "@/types/watchApi";

const CONTAINER_CLASS = [
  "mx-auto w-[min(calc(100%_-_4rem),72rem)] pb-16 pt-20",
  "max-[47.99rem]:w-[calc(100%_-_2.5rem)]",
  "max-[47.99rem]:pb-24 max-[47.99rem]:pt-20",
].join(" ");

const MAX_ROUTE_PAGE = 10_000;

function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

function readBrowserPage(): { page: number; valid: boolean } {
  if (typeof window === "undefined") return { page: 1, valid: true };

  const values = new URLSearchParams(window.location.search).getAll("page");
  if (values.length === 0) return { page: 1, valid: true };
  if (values.length !== 1 || !/^[1-9]\d{0,4}$/.test(values[0])) {
    return { page: 1, valid: false };
  }

  const page = Number(values[0]);
  return Number.isSafeInteger(page) && page <= MAX_ROUTE_PAGE
    ? { page, valid: true }
    : { page: 1, valid: false };
}


function watchCollectionMetadataTitle(basePath: string, title: string): string {
  if (basePath.startsWith("/watch/the-loai/")) return `Thể loại ${title} | Watch`;
  if (basePath.startsWith("/watch/quoc-gia/")) return `Quốc gia ${title} | Watch`;
  if (basePath.startsWith("/watch/danh-sach/")) return `Danh sách ${title} | Watch`;
  return `${title} | Watch`;
}

export default function WatchCollectionBrowser({
  source,
  basePath,
  title,
  backHref,
  backLabel,
}: {
  source: WatchCollectionSource;
  basePath: string;
  title: string;
  backHref: string;
  backLabel: string;
}) {
  // WatchQueryProvider mounts children only after its browser scope is ready, so
  // the lazy initializer sees the real deep-link query string on first mount.
  const [page, setPage] = useState(() => readBrowserPage().page);
  const resultsStartRef = useRef<HTMLDivElement>(null);
  const query = useWatchCollectionPage(source, page, true);
  const loadingPage = query.isPending || query.isPlaceholderData;
  const movies = useMemo(
    () => watchCollectionMovies(query.data?.items ?? []),
    [query.data],
  );
  const pagination = query.data?.pagination;
  const requestedOutOfRange = Boolean(
    !loadingPage && pagination && pagination.totalPages > 0 && page > pagination.totalPages,
  );

  useEffect(() => {
    const initial = readBrowserPage();
    if (!initial.valid || window.location.pathname + window.location.search !== pageHref(basePath, initial.page)) {
      window.history.replaceState(null, "", pageHref(basePath, initial.page));
    }
    setPage(initial.page);

    const handlePopState = () => {
      const next = readBrowserPage();
      if (!next.valid) {
        window.history.replaceState(null, "", basePath);
        setPage(1);
        return;
      }
      setPage(next.page);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [basePath]);

  const changePage = (nextPage: number) => {
    if (!Number.isSafeInteger(nextPage) || nextPage < 1 || nextPage > MAX_ROUTE_PAGE || nextPage === page) {
      return;
    }
    if (pagination && pagination.totalPages > 0 && nextPage > pagination.totalPages) return;

    // Native History API changes only the URL/search params. It deliberately
    // avoids a Next route navigation/RSC refresh; this mounted browser and its
    // Watch Query scope stay alive while only the page query key changes.
    window.history.pushState(null, "", pageHref(basePath, nextPage));
    setPage(nextPage);

    requestAnimationFrame(() => {
      resultsStartRef.current?.scrollIntoView({ block: "start", behavior: "auto" });
    });
  };

  const sectionLabel = source.kind === "genre"
    ? "THỂ LOẠI"
    : source.kind === "country"
      ? "QUỐC GIA"
      : "DANH SÁCH";
  const metadataTitle = watchCollectionMetadataTitle(basePath, title);
  const totalPages = pagination?.totalPages ?? 0;
  const totalItems = pagination?.totalItems;
  const itemsPerPage = pagination?.itemsPerPage;

  return (
    <>
      <WatchProtectedMetadata title={metadataTitle} />
      <main className="min-h-[70vh] bg-background text-foreground" data-watch-collection-browser>
      <div className={CONTAINER_CLASS}>
        <header className="mb-4 max-[47.99rem]:mb-3">
          <Link
            href={backHref}
            prefetch={false}
            className="inline-flex min-h-10 items-center gap-2 rounded-full text-sm font-semibold text-muted-foreground no-underline hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
          >
            <i className="fad fa-arrow-left" aria-hidden="true" />
            {backLabel}
          </Link>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="min-w-0">
              {/* <p className="m-0 text-[.68rem] font-bold tracking-[.18em] text-muted-foreground">
                VT WATCH · {sectionLabel}
              </p> */}
              <h1 className="m-0 text-[clamp(1.7rem,3vw,2rem)] font-black">
                {title}
              </h1>
              {/* <p className="m-0 mt-3 text-sm leading-6 text-muted-foreground">
                {pagination
                  ? `Trang ${page}/${Math.max(1, totalPages)} · ${(totalItems ?? 0).toLocaleString("vi-VN")} kết quả`
                  : `Trang ${page}`}
              </p> */}
            </div>
          </div>
        </header>

        <div ref={resultsStartRef} className="scroll-mt-24" aria-live="polite">
          {loadingPage && <WatchBrowseGridSkeleton count={10} />}

          {query.isError && !loadingPage && (
            <section className="rounded-2xl border border-border bg-card px-5 py-7 text-center" role="alert">
              <i className="fad fa-triangle-exclamation text-2xl text-muted-foreground" aria-hidden="true" />
              <h2 className="m-0 mt-3 text-lg font-bold">Chưa tải được danh sách phim</h2>
              <p className="mx-auto mt-2 mb-0 max-w-xl text-sm leading-6 text-muted-foreground">
                {watchApiErrorMessage(query.error)}
              </p>
              <button
                type="button"
                onClick={() => { void query.refetch(); }}
                className="mt-5 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              >
                <i className="fad fa-rotate-right" aria-hidden="true" />
                Thử lại
              </button>
            </section>
          )}

          {query.isSuccess && !loadingPage && requestedOutOfRange && pagination && (
            <section className="rounded-2xl border border-border bg-card px-5 py-7 text-center">
              <h2 className="m-0 text-lg font-bold">Trang này không có dữ liệu</h2>
              <p className="m-0 mt-2 text-sm text-muted-foreground">
                Danh sách này hiện có {pagination.totalPages} trang.
              </p>
              <button
                type="button"
                onClick={() => changePage(Math.max(1, pagination.totalPages))}
                className="mt-5 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-semibold text-foreground hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2"
              >
                Đến trang cuối
                <i className="fad fa-arrow-right" aria-hidden="true" />
              </button>
            </section>
          )}

          {query.isSuccess && !loadingPage && !requestedOutOfRange && movies.length === 0 && (
            <section className="rounded-2xl border border-border bg-card px-5 py-8 text-center">
              <i className="fad fa-film-slash text-2xl text-muted-foreground" aria-hidden="true" />
              <h2 className="m-0 mt-3 text-lg font-bold">Chưa có phim để hiển thị</h2>
              <p className="m-0 mt-2 text-sm text-muted-foreground">
                Nguồn phim chưa trả về mục hợp lệ cho trang này.
              </p>
            </section>
          )}

          {query.isSuccess && !loadingPage && !requestedOutOfRange && movies.length > 0 && (
            <WatchGrid movies={movies} label={`Danh sách phim ${title}`} />
          )}

          {!query.isError && pagination && !requestedOutOfRange && totalPages > 1 && (
            <WatchPagination
              basePath={basePath}
              currentPage={page}
              totalPages={totalPages}
              busy={loadingPage}
              onPageChange={changePage}
            />
          )}
        </div>
      </div>
      </main>
    </>
  );
}
