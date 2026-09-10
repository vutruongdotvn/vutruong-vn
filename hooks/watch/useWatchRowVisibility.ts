"use client";

import { useEffect, useRef, useState } from "react";

/** Once entered, a row stays subscribed. Scrolling away never cancels/refetches it. */
export function useWatchRowVisibility() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (visible || !node) return;
    if (typeof window.IntersectionObserver !== "function") { setVisible(true); return; }
    const observer = new window.IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) { observer.disconnect(); setVisible(true); }
    }, { rootMargin: "360px 0px", threshold: 0.01 });
    observer.observe(node);
    return () => observer.disconnect();
  }, [visible]);
  return { ref, visible, activate: () => setVisible(true) };
}
