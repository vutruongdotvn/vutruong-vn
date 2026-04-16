"use client";

import { useEffect, useState } from "react";

type Props = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  sidebarRef: React.RefObject<HTMLDivElement | null>;
  offsetTop?: number;
  breakpoint?: number;
};

export function useSmartStickySidebar({
  containerRef,
  sidebarRef,
  offsetTop = 80,
  breakpoint = 1024,
}: Props) {
  const [style, setStyle] = useState<React.CSSProperties>({});
  const [className, setClassName] = useState("");

  useEffect(() => {
    if (!containerRef.current || !sidebarRef.current) return;

    let lastScrollY = window.scrollY;
    let ticking = false;
    let frameId: number; // Thêm biến lưu ID của animation frame

    const handleScroll = () => {
      if (ticking) return;
      ticking = true;

      frameId = requestAnimationFrame(() => {
        // Lấy ref hiện tại
        const container = containerRef.current;
        const sidebar = sidebarRef.current;

        // 🚨 FIX LỖI Ở ĐÂY: Nếu component đã unmount (ref = null), thoát ngay lập tức
        if (!container || !sidebar) {
          ticking = false;
          return;
        }

        const scrollY = window.scrollY;
        const direction = scrollY > lastScrollY ? "down" : "up";
        lastScrollY = scrollY;

        // disable mobile
        if (window.innerWidth < breakpoint) {
          setStyle({});
          setClassName("");
          ticking = false;
          return;
        }

        const containerRect = container.getBoundingClientRect();
        const sidebarRect = sidebar.getBoundingClientRect();

        const containerTop = containerRect.top + scrollY;
        const containerBottom = containerTop + container.offsetHeight;

        const sidebarHeight = sidebar.offsetHeight;
        const viewportHeight = window.innerHeight;

        // case: sidebar nhỏ hơn viewport → sticky top đơn giản
        if (sidebarHeight < viewportHeight) {
          if (scrollY > containerTop - offsetTop) {
            setClassName("sticky-top");
            setStyle({
              position: "fixed",
              top: offsetTop,
              width: container.offsetWidth,
            });
          } else {
            setClassName("");
            setStyle({});
          }

          ticking = false;
          return;
        }

        // ----- SCROLL DOWN -----
        if (direction === "down") {
          const sidebarBottom = scrollY + viewportHeight;

          if (sidebarBottom >= containerBottom) {
            // chạm đáy container
            setClassName("stopped-bottom");
            setStyle({
              position: "absolute",
              bottom: 0,
              width: "100%",
            });
          } else {
            setClassName("sticky-bottom");
            setStyle({
              position: "fixed",
              bottom: 0,
              width: container.offsetWidth,
            });
          }
        }

        // ----- SCROLL UP -----
        if (direction === "up") {
          if (scrollY <= containerTop - offsetTop) {
            setClassName("");
            setStyle({});
          } else {
            setClassName("sticky-top");
            setStyle({
              position: "fixed",
              top: offsetTop,
              width: container.offsetWidth,
            });
          }
        }

        ticking = false;
      });
    };

    const handleResize = () => {
      setStyle({});
      setClassName("");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    return () => {
      // 🚨 DỌN DẸP SẠCH SẼ:
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (frameId) {
        cancelAnimationFrame(frameId); // Hủy frame đang chờ nếu component bị unmount
      }
    };
  }, [containerRef, sidebarRef, offsetTop, breakpoint]);

  return { style, className };
}