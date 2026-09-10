"use client";

import { useEffect, useRef, useState } from "react";
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
  const safeUrl = safeWatchTrailerUrl(trailerUrl);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const instanceRef = useRef<{ destroy: () => void } | null>(null);
  const mountedRef = useRef(true);
  const [opening, setOpening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
      instanceRef.current?.destroy();
      instanceRef.current = null;
    };
  }, []);

  async function openTrailer() {
    if (!safeUrl || opening) return;

    setOpening(true);
    setError(null);

    try {
      // Fancybox and its video code are downloaded only after this click.
      const { Fancybox } = await import("@fancyapps/ui/dist/fancybox/");
      if (!mountedRef.current) return;

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
      if (mountedRef.current) {
        setError("Chưa thể mở trailer. Vui lòng thử lại.");
      }
    } finally {
      if (mountedRef.current) setOpening(false);
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
        <i className={opening ? "fad fa-spinner-third fa-spin" : "fad fa-play-circle"} aria-hidden="true" />
        {opening ? "Đang mở…" : "Xem Trailer"}
      </button>

      {error && (
        <p id="watch-trailer-error" className="m-0 mt-2 text-xs text-destructive" role="status">
          {error}
        </p>
      )}
    </div>
  );
}
