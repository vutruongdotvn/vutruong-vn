"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";
import { watchAutoplayEmbedUrl } from "@/lib/watch/nguoncEndpoints";

type Props = {
  src: string;
  title: string;
  hasAlternateSource?: boolean;
  onChooseAlternateSource?: () => void;
};

type PlayerState = "authorizing" | "loading" | "ready" | "error";

function bestEffortAutoplayUrl(value: string): string | null {
  const safeUrl = watchAutoplayEmbedUrl(value);
  if (!safeUrl) return null;

  try {
    const url = new URL(safeUrl);

    // `autoplay=1` is already added by watchAutoplayEmbedUrl().
    // Muted + playsinline gives cross-origin embeds the best chance to autoplay
    // under modern browser policies. These are fixed local hints added only
    // after the original StreamC URL passed the strict allowlist.
    url.searchParams.set("muted", "1");
    url.searchParams.set("playsinline", "1");

    return url.href;
  } catch {
    return null;
  }
}

/**
 * Never renders an iframe src. A fresh access permit is required immediately
 * before assigning it in the browser, and revocation removes it synchronously.
 *
 * Autoplay is best-effort because the final media element lives inside a
 * cross-origin StreamC iframe. The parent can grant autoplay permission and
 * send autoplay/muted hints, but cannot call play() inside that remote player.
 */
export default function WatchRemotePlayer({
  src,
  title,
  hasAlternateSource = false,
  onChooseAlternateSource,
}: Props) {
  const scope = useWatchQueryScope();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const loadTimerRef = useRef<number | null>(null);
  const [state, setState] = useState<PlayerState>("authorizing");
  const [attempt, setAttempt] = useState(0);

  const playerUrl = useMemo(() => bestEffortAutoplayUrl(src), [src]);

  function clearLoadTimer() {
    if (loadTimerRef.current !== null) {
      window.clearTimeout(loadTimerRef.current);
      loadTimerRef.current = null;
    }
  }

  useEffect(() => {
    const iframe = iframeRef.current;

    if (!iframe || !playerUrl) {
      setState("error");
      return;
    }

    const consumer = new AbortController();
    let mounted = true;
    let removePermitListener: (() => void) | undefined;

    const removeSrc = () => {
      clearLoadTimer();
      iframe.removeAttribute("src");
      iframe.dataset.state = "empty";
    };

    const revoke = () => {
      removeSrc();
      if (mounted) setState("authorizing");
    };

    setState("authorizing");
    removeSrc();

    void scope.permitMedia(consumer.signal).then(permit => {
      if (
        consumer.signal.aborted
        || permit.signal.aborted
        || !scope.getSnapshot().ready
      ) {
        return;
      }

      permit.signal.addEventListener("abort", revoke, { once: true });
      removePermitListener = () => permit.signal.removeEventListener("abort", revoke);

      // No await is allowed between this final permission check and src assignment.
      if (!permit.signal.aborted && !consumer.signal.aborted) {
        setState("loading");
        iframe.dataset.state = "loading";
        iframe.src = playerUrl;

        // A network-level iframe load that never resolves should not leave the
        // UI spinning forever. This does not attempt another source automatically.
        loadTimerRef.current = window.setTimeout(() => {
          if (!mounted || consumer.signal.aborted) return;
          iframe.removeAttribute("src");
          iframe.dataset.state = "error";
          setState("error");
        }, 20_000);
      }
    }).catch(() => {
      if (!consumer.signal.aborted && mounted && scope.getSnapshot().ready) {
        setState("error");
      }
    });

    return () => {
      mounted = false;
      consumer.abort();
      removePermitListener?.();
      removeSrc();
    };
  }, [attempt, playerUrl, scope]);

  function retryCurrentSource() {
    if (state === "authorizing" || state === "loading") return;
    setAttempt(value => value + 1);
  }

  return (
    <div
      className="relative aspect-video overflow-hidden"
      aria-busy={state === "authorizing" || state === "loading"}
      data-watch-player-state={state}
    >
      {state !== "ready" && (
        <div
          className="absolute inset-0 z-1 flex items-center justify-center bg-black text-white"
          role="status"
        >
          {state === "error" ? (
            <div className="w-full max-w-md px-6 text-center">
              <span
                className="mx-auto grid size-12 place-items-center rounded-full border border-white/12 bg-white/6 text-white/75"
                aria-hidden="true"
              >
                <i className="fad fa-triangle-exclamation text-xl" />
              </span>

              <h2 className="m-0 mt-4 text-lg font-bold">
                Nguồn phát chưa sẵn sàng
              </h2>

              <p className="m-0 mt-2 text-sm leading-6 text-white/65">
                Bạn có thể thử tải lại nguồn hiện tại hoặc chủ động chuyển sang nguồn khác.
              </p>

              <div className="mt-5 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-black hover:bg-white/90 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-3"
                  onClick={retryCurrentSource}
                >
                  <i className="fad fa-rotate-right" aria-hidden="true" />
                  Thử lại nguồn này
                </button>

                {hasAlternateSource && onChooseAlternateSource && (
                  <button
                    type="button"
                    className="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-white/18 bg-white/8 px-4 text-sm font-semibold text-white hover:bg-white/14 focus-visible:outline-2 focus-visible:outline-white focus-visible:outline-offset-3"
                    onClick={onChooseAlternateSource}
                  >
                    <i className="fad fa-shuffle" aria-hidden="true" />
                    Nguồn khác
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="px-6 text-center">
              <i
                className="fad fa-spinner-third fa-spin text-2xl text-white/75"
                aria-hidden="true"
              />
              <p className="m-0 mt-3 text-sm text-white/70">
                {state === "authorizing"
                  ? "Đang xác minh nguồn phát"
                  : "Đang tải trình phát"}
              </p>
            </div>
          )}
        </div>
      )}

      <iframe
        ref={iframeRef}
        title={title}
        className="absolute inset-0 size-full border-0 bg-black"
        loading="eager"
        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
        allowFullScreen
        referrerPolicy="no-referrer"
        sandbox="allow-forms allow-presentation allow-same-origin allow-scripts"
        onLoad={event => {
          if (event.currentTarget.hasAttribute("src")) {
            clearLoadTimer();
            event.currentTarget.dataset.state = "loaded";
            setState("ready");
          }
        }}
        onError={event => {
          clearLoadTimer();
          event.currentTarget.removeAttribute("src");
          event.currentTarget.dataset.state = "error";
          setState("error");
        }}
      />
    </div>
  );
}