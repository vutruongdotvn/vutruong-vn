"use client";

import { useLayoutEffect } from "react";

const WATCH_FALLBACK_TITLE = "Watch";
const WATCH_FALLBACK_DESCRIPTION =
  "Xem phim giải trí, miễn phí, không quảng cáo, tốc độ cao và cập nhật liên tục.";
const WATCH_FALLBACK_IMAGE =
  "https://www.vutruong.vn/images/og-watch.png";

type Props = {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
};

type MetaSpec = {
  selector: string;
  attribute: "name" | "property";
  key: string;
  content: string;
};

type MetaSnapshot = MetaSpec & {
  existed: boolean;
  previous: string | null;
};

function compactDescription(value: string | null | undefined): string {
  const text = (value ?? "").replace(/\s+/g, " ").trim();
  if (!text) return WATCH_FALLBACK_DESCRIPTION;
  if (text.length <= 150) return text;

  const clipped = text.slice(0, 149);
  const wordBoundary = clipped.lastIndexOf(" ");
  const end = wordBoundary >= 100 ? wordBoundary : 149;
  return `${clipped.slice(0, end).trimEnd()}…`;
}

function compactTitle(value: string): string {
  const text = value.replace(/\s+/g, " ").trim();
  return text.length <= 140
    ? text
    : `${text.slice(0, 139).trimEnd()}…`;
}

function absoluteImage(value: string | null | undefined): string {
  if (!value) return WATCH_FALLBACK_IMAGE;

  try {
    return new URL(value, window.location.origin).href;
  } catch {
    return WATCH_FALLBACK_IMAGE;
  }
}

function findMeta(selector: string): HTMLMetaElement | null {
  return document.head.querySelector<HTMLMetaElement>(selector);
}

function ensureMeta(spec: MetaSpec): HTMLMetaElement {
  let element = findMeta(spec.selector);

  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(spec.attribute, spec.key);
    document.head.appendChild(element);
  }

  if (element.getAttribute("content") !== spec.content) {
    element.setAttribute("content", spec.content);
  }

  return element;
}

function snapshotMeta(spec: MetaSpec): MetaSnapshot {
  const element = findMeta(spec.selector);

  return {
    ...spec,
    existed: Boolean(element),
    previous: element?.getAttribute("content") ?? null,
  };
}

function restoreMeta(snapshot: MetaSnapshot) {
  const element = findMeta(snapshot.selector);

  // A newer route already owns this field: never overwrite it.
  if (element?.getAttribute("content") !== snapshot.content) {
    return;
  }

  if (!snapshot.existed) {
    element?.remove();
    return;
  }

  if (!element) {
    const restored = document.createElement("meta");
    restored.setAttribute(snapshot.attribute, snapshot.key);

    if (snapshot.previous !== null) {
      restored.setAttribute("content", snapshot.previous);
    }

    document.head.appendChild(restored);
    return;
  }

  if (snapshot.previous === null) {
    element.removeAttribute("content");
  } else {
    element.setAttribute("content", snapshot.previous);
  }
}

/**
 * Browser-only metadata owner for authorized Watch movie/player screens.
 *
 * Privacy/security:
 * - Never fetches.
 * - Receives only already-authorized/sanitized browser data.
 * - Server/crawler continues to receive generic Watch metadata.
 * - While mounted, it reclaims movie metadata if Next's head manager commits
 *   the parent Watch metadata after hydration/navigation.
 * - On logout/revoke/unmount, observer stops first and metadata is restored
 *   only if this component still owns the current values.
 */
export default function WatchRuntimeMetadata({
  title,
  description,
  imageUrl,
}: Props) {
  useLayoutEffect(() => {
    const nextTitle = compactTitle(title || WATCH_FALLBACK_TITLE);
    const nextDescription = compactDescription(description);
    const nextImage = absoluteImage(imageUrl);

    const specs: MetaSpec[] = [
      {
        selector: 'meta[name="description"]',
        attribute: "name",
        key: "description",
        content: nextDescription,
      },
      {
        selector: 'meta[property="og:title"]',
        attribute: "property",
        key: "og:title",
        content: nextTitle,
      },
      {
        selector: 'meta[property="og:description"]',
        attribute: "property",
        key: "og:description",
        content: nextDescription,
      },
      {
        selector: 'meta[property="og:image"]',
        attribute: "property",
        key: "og:image",
        content: nextImage,
      },
      {
        selector: 'meta[name="twitter:title"]',
        attribute: "name",
        key: "twitter:title",
        content: nextTitle,
      },
      {
        selector: 'meta[name="twitter:description"]',
        attribute: "name",
        key: "twitter:description",
        content: nextDescription,
      },
      {
        selector: 'meta[name="twitter:image"]',
        attribute: "name",
        key: "twitter:image",
        content: nextImage,
      },
    ];

    const previousTitle = document.title;
    const snapshots = specs.map(snapshotMeta);
    let active = true;

    const apply = () => {
      if (!active) return;

      if (document.title !== nextTitle) {
        document.title = nextTitle;
      }

      specs.forEach(ensureMeta);
    };

    // Run before paint once authorized data has mounted.
    apply();

    // Next can commit parent metadata after hydration/navigation. Reclaim only
    // while this authorized movie/player owner is still mounted.
    const observer = new MutationObserver(() => {
      apply();
    });

    observer.observe(document.head, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["content"],
    });

    return () => {
      active = false;
      observer.disconnect();

      // Restore in reverse order, without clobbering a newer route owner.
      snapshots.reverse().forEach(restoreMeta);

      if (document.title === nextTitle) {
        document.title = previousTitle || WATCH_FALLBACK_TITLE;
      }
    };
  }, [title, description, imageUrl]);

  return null;
}