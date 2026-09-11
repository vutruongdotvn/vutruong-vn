"use client";

import type { MouseEvent } from "react";

function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}?page=${page}`;
}

type Token = number | "start-gap" | "end-gap";

function pageTokens(currentPage: number, totalPages: number): Token[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) return [1, 2, 3, 4, 5, "end-gap", totalPages];
  if (currentPage >= totalPages - 3) {
    return [1, "start-gap", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, "start-gap", currentPage - 1, currentPage, currentPage + 1, "end-gap", totalPages];
}

const BUTTON_CLASS = [
  "inline-flex size-10 shrink-0 items-center justify-center rounded-full border",
  "text-sm font-semibold no-underline transition-colors",
  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2",
].join(" ");

function shouldUseNativeNavigation(event: MouseEvent<HTMLAnchorElement>): boolean {
  return event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

export default function WatchPagination({
  basePath,
  currentPage,
  totalPages,
  busy = false,
  onPageChange,
}: {
  basePath: string;
  currentPage: number;
  totalPages: number;
  busy?: boolean;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  const tokens = pageTokens(currentPage, totalPages);

  const navigate = (event: MouseEvent<HTMLAnchorElement>, page: number) => {
    // Keep ctrl/cmd/shift/middle-click working as a real shareable URL/new tab.
    if (shouldUseNativeNavigation(event)) return;
    event.preventDefault();
    if (!busy) onPageChange(page);
  };

  const linkClass = `${BUTTON_CLASS} border-border bg-card text-foreground hover:bg-accent ${busy ? "cursor-wait opacity-55" : ""}`;

  return (
    <nav
      className="mt-10 flex flex-wrap items-center justify-center gap-2 max-[39.99rem]:mt-8 max-[39.99rem]:gap-1.5"
      aria-label="Phân trang phim"
      aria-busy={busy || undefined}
    >
      {currentPage > 1 ? (
        <a
          href={pageHref(basePath, currentPage - 1)}
          className={linkClass}
          aria-label={`Trang trước, trang ${currentPage - 1}`}
          aria-disabled={busy || undefined}
          onClick={event => navigate(event, currentPage - 1)}
        >
          <i className="fad fa-chevron-left" aria-hidden="true" />
        </a>
      ) : (
        <span className={`${BUTTON_CLASS} cursor-not-allowed border-border bg-muted text-muted-foreground opacity-45`} aria-hidden="true">
          <i className="fad fa-chevron-left" />
        </span>
      )}

      {tokens.map(token => {
        if (typeof token !== "number") {
          return (
            <span key={token} className="grid size-8 place-items-center text-sm text-muted-foreground" aria-hidden="true">
              …
            </span>
          );
        }

        const active = token === currentPage;
        return active ? (
          <span
            key={token}
            className={`${BUTTON_CLASS} border-primary bg-primary text-primary-foreground`}
            aria-current="page"
            aria-label={`Trang ${token}, trang hiện tại`}
          >
            {token}
          </span>
        ) : (
          <a
            key={token}
            href={pageHref(basePath, token)}
            className={linkClass}
            aria-label={`Đến trang ${token}`}
            aria-disabled={busy || undefined}
            onClick={event => navigate(event, token)}
          >
            {token}
          </a>
        );
      })}

      {currentPage < totalPages ? (
        <a
          href={pageHref(basePath, currentPage + 1)}
          className={linkClass}
          aria-label={`Trang sau, trang ${currentPage + 1}`}
          aria-disabled={busy || undefined}
          onClick={event => navigate(event, currentPage + 1)}
        >
          <i className="fad fa-chevron-right" aria-hidden="true" />
        </a>
      ) : (
        <span className={`${BUTTON_CLASS} cursor-not-allowed border-border bg-muted text-muted-foreground opacity-45`} aria-hidden="true">
          <i className="fad fa-chevron-right" />
        </span>
      )}
    </nav>
  );
}
