"use client";

import { useEffect, useState } from "react";
import type { CSSProperties, RefObject } from "react";

type Props = {
  containerRef: RefObject<HTMLDivElement | null>;
  sidebarRef: RefObject<HTMLDivElement | null>;
  offsetTop?: number;
  offsetBottom?: number;
  breakpoint?: number;
};

type SidebarMode = "normal" | "fixed-top" | "fixed-bottom" | "absolute";

const MODE_CLASS_NAMES: Record<SidebarMode, string> = {
  normal: "",
  "fixed-top": "sticky-top",
  "fixed-bottom": "sticky-bottom",
  absolute: "stopped-bottom",
};

type SidebarView = {
  mode: SidebarMode;
  style: CSSProperties;
};

const NORMAL_VIEW: SidebarView = {
  mode: "normal",
  style: {},
};

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

const stylesAreEqual = (first: CSSProperties, second: CSSProperties) => {
  const firstEntries = Object.entries(first);
  const secondEntries = Object.entries(second);

  return (
    firstEntries.length === secondEntries.length &&
    firstEntries.every(
      ([key, value]) => second[key as keyof CSSProperties] === value
    )
  );
};

/**
 * Sidebar sticky theo hướng cuộn:
 * - Sidebar thấp: bám đầu viewport như sticky thông thường.
 * - Sidebar cao: cuộn tự nhiên đến khi chạm đáy/đầu viewport rồi mới cố định.
 * - Khi đổi hướng, sidebar được chuyển sang absolute tại đúng vị trí hiện tại để
 *   không bị nhảy từ đầu xuống đáy viewport (hoặc ngược lại).
 */
export function useSmartStickySidebar({
  containerRef,
  sidebarRef,
  offsetTop = 80,
  offsetBottom = 80,
  breakpoint = 1024,
}: Props) {
  const [view, setView] = useState<SidebarView>(NORMAL_VIEW);

  useEffect(() => {
    const initialContainer = containerRef.current;
    const initialSidebar = sidebarRef.current;

    if (!initialContainer || !initialSidebar) return;

    let mode: SidebarMode = "normal";
    let absoluteTop = 0;
    let lastScrollY = window.scrollY;
    let frameId: number | null = null;
    let destroyed = false;

    const commit = (
      nextMode: SidebarMode,
      nextStyle: CSSProperties,
      nextAbsoluteTop?: number
    ) => {
      mode = nextMode;

      if (typeof nextAbsoluteTop === "number") {
        absoluteTop = nextAbsoluteTop;
      }

      setView((current) => {
        if (current.mode === nextMode && stylesAreEqual(current.style, nextStyle)) {
          return current;
        }

        return { mode: nextMode, style: nextStyle };
      });
    };

    const reset = () => commit("normal", {});

    const update = () => {
      frameId = null;

      if (destroyed) return;

      const container = containerRef.current;
      const sidebar = sidebarRef.current;
      const scrollY = window.scrollY;
      const scrollDelta = scrollY - lastScrollY;
      const direction =
        scrollDelta > 0 ? "down" : scrollDelta < 0 ? "up" : "idle";

      lastScrollY = scrollY;

      if (!container || !sidebar || window.innerWidth < breakpoint) {
        reset();
        return;
      }

      // Overlay toàn màn hình (ví dụ modal quản lý) tự quản lý việc khóa cuộn.
      // Giữ nguyên sidebar phía sau và đo lại ngay sau khi overlay đóng.
      if (document.documentElement.dataset.smartStickyPaused === "true") return;

      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top + scrollY;
      const containerHeight = container.offsetHeight;
      const containerBottom = containerTop + containerHeight;
      const sidebarHeight = sidebar.offsetHeight;
      const viewportHeight = window.innerHeight;
      const viewportSafeBottom = viewportHeight - offsetBottom;
      const maximumTop = Math.max(containerHeight - sidebarHeight, 0);
      const columnLeft = containerRect.left;
      const columnWidth = containerRect.width;

      const fixedTopStyle: CSSProperties = {
        position: "fixed",
        top: offsetTop,
        left: columnLeft,
        width: columnWidth,
      };

      const fixedBottomStyle: CSSProperties = {
        position: "fixed",
        bottom: offsetBottom,
        left: columnLeft,
        width: columnWidth,
      };

      const setAbsolute = (top: number) => {
        const safeTop = clamp(top, 0, maximumTop);

        commit(
          "absolute",
          {
            position: "absolute",
            top: safeTop,
            left: 0,
            width: "100%",
          },
          safeTop
        );
      };

      // Không có không gian để sidebar di chuyển bên trong cột.
      if (maximumTop <= 0) {
        reset();
        return;
      }

      // Trở lại bố cục ban đầu khi lên tới đầu cột.
      if (scrollY <= containerTop - offsetTop) {
        reset();
        return;
      }

      // Sidebar nằm gọn trong viewport: sticky đầu trang và dừng ở đáy cột.
      if (sidebarHeight + offsetTop + offsetBottom <= viewportHeight) {
        const relativeTop = scrollY + offsetTop - containerTop;

        if (relativeTop >= maximumTop) setAbsolute(maximumTop);
        else commit("fixed-top", fixedTopStyle);

        return;
      }

      // Khi viewport đã tới cuối cột, sidebar phải dừng đúng đáy container.
      if (scrollY + viewportSafeBottom >= containerBottom) {
        setAbsolute(maximumTop);
        return;
      }

      if (mode === "fixed-top") {
        if (direction === "down") {
          // Giữ nguyên tọa độ nhìn thấy rồi để sidebar tiếp tục cuộn lên tự nhiên.
          setAbsolute(scrollY + offsetTop - containerTop);
        } else if (scrollY + offsetTop + sidebarHeight >= containerBottom) {
          setAbsolute(maximumTop);
        } else {
          commit("fixed-top", fixedTopStyle);
        }

        return;
      }

      if (mode === "fixed-bottom") {
        if (direction === "up") {
          const viewportTop = viewportSafeBottom - sidebarHeight;
          setAbsolute(scrollY + viewportTop - containerTop);
        } else {
          commit("fixed-bottom", fixedBottomStyle);
        }

        return;
      }

      if (mode === "absolute") {
        const viewportTop = containerTop + absoluteTop - scrollY;
        const viewportBottom = viewportTop + sidebarHeight;

        if (direction === "up" && viewportTop >= offsetTop) {
          commit("fixed-top", fixedTopStyle);
        } else if (
          (direction === "down" || direction === "idle") &&
          viewportBottom <= viewportSafeBottom
        ) {
          commit("fixed-bottom", fixedBottomStyle);
        }

        return;
      }

      // Trạng thái ban đầu: để sidebar cuộn cùng tài liệu đến khi đáy vừa
      // chạm đáy viewport, sau đó mới cố định.
      const naturalViewportBottom = containerTop - scrollY + sidebarHeight;

      if (naturalViewportBottom <= viewportSafeBottom) {
        commit("fixed-bottom", fixedBottomStyle);
      }
    };

    const scheduleUpdate = () => {
      if (frameId !== null || destroyed) return;
      frameId = requestAnimationFrame(update);
    };

    const handleResize = () => {
      mode = "normal";
      absoluteTop = 0;
      reset();
      scheduleUpdate();
    };

    const resizeObserver =
      typeof ResizeObserver === "undefined"
        ? null
        : new ResizeObserver(() => scheduleUpdate());

    resizeObserver?.observe(initialContainer);
    resizeObserver?.observe(initialSidebar);

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", handleResize);
    window.addEventListener("smart-sticky:refresh", scheduleUpdate);

    scheduleUpdate();

    return () => {
      destroyed = true;
      resizeObserver?.disconnect();
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("smart-sticky:refresh", scheduleUpdate);

      if (frameId !== null) cancelAnimationFrame(frameId);
    };
  }, [breakpoint, containerRef, offsetBottom, offsetTop, sidebarRef]);

  return {
    style: view.style,
    className: MODE_CLASS_NAMES[view.mode],
  };
}