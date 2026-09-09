"use client";

import { useEffect, useRef } from "react";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";
import { safeWatchImageUrl } from "@/lib/watch/nguoncEndpoints";

/** No remote src during SSR, render, or pending authorization. Native images
 * go straight to Nguonc, without Next Image/Vercel. Revoke removes src at once;
 * bytes already sent while permitted cannot be recalled by any browser guard.
 */
export default function WatchRemoteImage({ src, alt = "", className, priority = false }: {
  src: string | null; alt?: string; className?: string; priority?: boolean;
}) {
  const scope = useWatchQueryScope();
  const ref = useRef<HTMLImageElement>(null);
  const safeSrc = safeWatchImageUrl(src);

  useEffect(() => {
    const node = ref.current;
    if (!node || !safeSrc) return;
    const consumer = new AbortController();
    let removePermitListener: (() => void) | undefined;
    const clear = () => {
      node.removeAttribute("src");
      node.dataset.state = "empty";
    };
    node.dataset.state = "loading";
    void scope.permitMedia(consumer.signal).then(permit => {
      if (consumer.signal.aborted || permit.signal.aborted || !scope.getSnapshot().ready) return;
      permit.signal.addEventListener("abort", clear, { once: true });
      removePermitListener = () => permit.signal.removeEventListener("abort", clear);
      // Synchronous final check and assignment: React cannot commit a stale src
      // after permission changed while an asynchronous render was in progress.
      if (!permit.signal.aborted && !consumer.signal.aborted) node.src = safeSrc;
    }).catch(() => {
      if (!consumer.signal.aborted) { clear(); node.dataset.state = "error"; }
    });
    return () => { consumer.abort(); removePermitListener?.(); clear(); };
  }, [safeSrc, scope]);

  // Deliberately no next/image: the source doesn't provide CORS on its images,
  // and an optimizer or image proxy would send movie data through Vercel.
  return <img ref={ref} alt={alt} className={className} decoding="async"
    loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"}
    referrerPolicy="no-referrer" draggable={false}
    onLoad={event => { if (event.currentTarget.hasAttribute("src")) event.currentTarget.dataset.state = "loaded"; }}
    onError={event => { event.currentTarget.removeAttribute("src"); event.currentTarget.dataset.state = "error"; }} />;
}
