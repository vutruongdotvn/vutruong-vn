"use client";

import { useEffect, useRef, useState } from "react";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";
import { safeWatchTrailerUrl } from "@/lib/watch/nguoncEndpoints";

type Props = {
  movieName: string;
  trailerUrl: string | null;
};

const BUTTON_CLASS = [
  "inline-flex min-h-12 items-center justify-center gap-2.5 rounded-full border",
  "border-border bg-card/90 px-5 text-sm font-semibold text-foreground",
  "shadow-sm backdrop-blur-sm hover:bg-accent",
  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-3",
  "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-card/90",
].join(" ");

export default function WatchTrailerButton({ movieName, trailerUrl }: Props) {
  const scope = useWatchQueryScope();
  const safeUrl = safeWatchTrailerUrl(trailerUrl);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const instanceRef = useRef<{ destroy: () => void } | null>(null);
  const attemptRef = useRef<AbortController | null>(null);
  const detachPermitRef = useRef<(() => void) | null>(null);
  const mountedRef = useRef(true);

  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function clearPermitListener() {
    detachPermitRef.current?.();
    detachPermitRef.current = null;
  }

  function destroyTrailer() {
    instanceRef.current?.destroy();
    instanceRef.current = null;
  }

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      attemptRef.current?.abort();
      attemptRef.current = null;
      clearPermitListener();
      destroyTrailer();
    };
  }, []);

  async function openTrailer() {
    if (!safeUrl || opening) return;

    // A repeated explicit click owns a fresh media authorization attempt.
    attemptRef.current?.abort();
    clearPermitListener();
    destroyTrailer();

    const consumer = new AbortController();
    attemptRef.current = consumer;

    setOpening(true);
    setError(null);

    try {
      // Security contract shared with WatchRemoteImage / WatchRemotePlayer:
      // authorize immediately before any remote media can be created.
      const permit = await scope.permitMedia(consumer.signal);

      if (
        !mountedRef.current
        || consumer.signal.aborted
        || permit.signal.aborted
        || !scope.getSnapshot().ready
      ) {
        return;
      }

      const closeOnRevoke = () => {
        destroyTrailer();
      };

      permit.signal.addEventListener("abort", closeOnRevoke, { once: true });
      detachPermitRef.current = () => {
        permit.signal.removeEventListener("abort", closeOnRevoke);
      };

      // Fancybox and its video code are still downloaded only after the
      // explicit click AND after a fresh Watch permit has been granted.
      const { Fancybox } = await import("@fancyapps/ui/dist/fancybox/");

      // Authorization may have changed while the dynamic import was in flight.
      // Keep this as the final synchronous gate immediately before show().
      if (
        !mountedRef.current
        || consumer.signal.aborted
        || permit.signal.aborted
        || !scope.getSnapshot().ready
      ) {
        clearPermitListener();
        return;
      }

      instanceRef.current = Fancybox.show(
        [{
          src: safeUrl,
          type: "youtube",
          aspectRatio: "16 / 9",
          width: "min(960px, calc(100vw - 2rem))",
          autoplay: true,
        }],
        {
          theme: document.documentElement.classList.contains("dark") ? "dark" : "light",
          closeExisting: true,
          closeButton: true,
          backdropClick: "close",
          dragToClose: true,
          Hash: false,
          modal: true,
          placeFocusBack: true,
          triggerEl: buttonRef.current ?? undefined,
          Carousel: {
            infinite: false,
            Thumbs: false,
            Toolbar: {
              absolute: true,
              enabled: true,
              display: { left: [], middle: [], right: ["close"] },
            },
            Video: {
              autoplay: true,
              iframeAttr: {
                allow: "autoplay; fullscreen; encrypted-media; picture-in-picture",
                allowfullscreen: "",
                referrerPolicy: "no-referrer",
                scrolling: "no",
              },
              youtube: {
                controls: 1,
                enablejsapi: 1,
                nocookie: 1,
                rel: 0,
                fs: 1,
              },
            },
          },
        },
      ) ?? null;
    } catch {
      // Logout/revoke/unmount cancellation is an expected security path,
      // not a user-facing trailer failure.
      if (
        mountedRef.current
        && !consumer.signal.aborted
        && scope.getSnapshot().ready
      ) {
        setError("Chưa thể mở trailer. Vui lòng thử lại.");
      }
    } finally {
      if (attemptRef.current === consumer) {
        attemptRef.current = null;

        if (mountedRef.current) {
          setOpening(false);
        }
      }
    }
  }

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        className={BUTTON_CLASS}
        disabled={!safeUrl || opening}
        title={!safeUrl ? "NguồnC chưa cung cấp trailer cho phim này" : undefined}
        aria-label={`Xem trailer ${movieName}`}
        aria-describedby={error ? "watch-trailer-error" : undefined}
        onClick={() => void openTrailer()}
      >
        <i
          className={opening ? "fad fa-spinner-third fa-spin" : "fad fa-play-circle"}
          aria-hidden="true"
        />
        {opening ? "Đang mở…" : "Xem Trailer"}
      </button>

      {error && (
        <p
          id="watch-trailer-error"
          className="m-0 mt-2 text-xs text-destructive"
          role="status"
        >
          {error}
        </p>
      )}
    </div>
  );
}