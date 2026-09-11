"use client";

import { useLayoutEffect } from "react";

const WATCH_FALLBACK_TITLE = "Watch";

type Props = {
  title: string;
};

export default function WatchProtectedMetadata({ title }: Props) {
  useLayoutEffect(() => {
    const nextTitle = title.replace(/\s+/g, " ").trim() || WATCH_FALLBACK_TITLE;
    let active = true;

    const applyTitle = () => {
      if (!active || document.title === nextTitle) return;
      document.title = nextTitle;
    };

    applyTitle();

    const observer = new MutationObserver(() => {
      applyTitle();
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    return () => {
      active = false;
      observer.disconnect();

      if (document.title === nextTitle) {
        document.title = WATCH_FALLBACK_TITLE;
      }
    };
  }, [title]);

  return null;
}
