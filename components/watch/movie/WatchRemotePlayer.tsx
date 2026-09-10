"use client";

import { useEffect, useRef, useState } from "react";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";
import { watchAutoplayEmbedUrl } from "@/lib/watch/nguoncEndpoints";

type Props = {
  src: string;
  title: string;
};

type PlayerState = "authorizing" | "loading" | "ready" | "error";

/**
 * Never renders an iframe src. A fresh access permit is required immediately
 * before assigning it in the browser, and revocation removes it synchronously.
 */
export default function WatchRemotePlayer({ src, title }: Props) {
  const scope = useWatchQueryScope();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<PlayerState>("authorizing");
  const safeAutoplayUrl = watchAutoplayEmbedUrl(src);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe || !safeAutoplayUrl) {
      setState("error");
      return;
    }

    const consumer = new AbortController();
    let mounted = true;
    let removePermitListener: (() => void) | undefined;

    const clear = () => {
      iframe.removeAttribute("src");
      iframe.dataset.state = "empty";
      if (mounted) setState("authorizing");
    };

    setState("authorizing");

    void scope.permitMedia(consumer.signal).then(permit => {
      if (consumer.signal.aborted || permit.signal.aborted || !scope.getSnapshot().ready) return;

      permit.signal.addEventListener("abort", clear, { once: true });
      removePermitListener = () => permit.signal.removeEventListener("abort", clear);

      // No await is allowed between this final permission check and src assignment.
      if (!permit.signal.aborted && !consumer.signal.aborted) {
        setState("loading");
        iframe.dataset.state = "loading";
        iframe.src = safeAutoplayUrl;
      }
    }).catch(() => {
      if (!consumer.signal.aborted && mounted) setState("error");
    });

    return () => {
      mounted = false;
      consumer.abort();
      removePermitListener?.();
      clear();
    };
  }, [safeAutoplayUrl, scope]);

  return (
    <div
      className="relative aspect-video overflow-hidden rounded-3xl border border-border bg-black shadow-[0_24px_70px_rgb(0_0_0/22%)]"
      aria-busy={state !== "ready"}
    >
      {state !== "ready" && (
        <div className="absolute inset-0 z-1 flex items-center justify-center bg-black text-white" role="status">
          {state === "error" ? (
            <div className="px-6 text-center">
              <i className="fad fa-triangle-exclamation text-2xl text-white/70" aria-hidden="true" />
              <p className="m-0 mt-3 text-sm text-white/75">Không thể mở nguồn phát này.</p>
            </div>
          ) : (
            <div className="px-6 text-center">
              <i className="fad fa-spinner-third fa-spin text-2xl text-white/75" aria-hidden="true" />
              <p className="m-0 mt-3 text-sm text-white/70">
                {state === "authorizing" ? "Đang xác minh nguồn phát…" : "Đang tải trình phát…"}
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
            event.currentTarget.dataset.state = "loaded";
            setState("ready");
          }
        }}
        onError={() => setState("error")}
      />
    </div>
  );
}
