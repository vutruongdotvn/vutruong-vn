"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { useUser } from "@/hooks/useUser";

const menuItems = [
  {
    label: "Home",
    href: "/",
    icon: "fa-house",
  },
  {
    label: "Blog",
    href: "/blog",
    icon: "fa-signature",
  },
  {
    label: "Watch",
    href: "/watch",
    icon: "fa-film",
  },
  {
    label: "CV",
    href: "/cv",
    icon: "fa-briefcase",
  },
];

const TOP_REVEAL_OFFSET = 48;
const HIDE_AFTER_SCROLL = 96;
const DIRECTION_NOISE_THRESHOLD = 2;
const HIDE_DISTANCE_THRESHOLD = 32;
const SHOW_DISTANCE_THRESHOLD = 18;

export default function LiquidMenu() {
  const pathname = usePathname();
  const { role } = useUser();
  const shouldReduceMotion = useReducedMotion();
  const [isVisible, setIsVisible] = useState(true);

  const lastScrollYRef = useRef(0);
  const directionRef = useRef<"up" | "down" | null>(null);
  const accumulatedDistanceRef = useRef(0);
  const tickingRef = useRef(false);

  const visibleMenuItems =
    role === "admin"
      ? menuItems
      : menuItems.filter((item) => item.href !== "/cv");

  const isActive = (href: string) => {
    return href === "/"
      ? pathname === "/"
      : pathname === href || pathname.startsWith(`${href}/`);
  };

  const activeIndex = visibleMenuItems.findIndex((item) =>
    isActive(item.href)
  );
  const itemWidth = `${100 / (visibleMenuItems.length + 1)}%`;

  useEffect(() => {
    // Khi đổi route, luôn đưa menu trở lại trạng thái hiển thị.
    setIsVisible(true);
    lastScrollYRef.current = Math.max(0, window.scrollY);
    directionRef.current = null;
    accumulatedDistanceRef.current = 0;
  }, [pathname]);

  useEffect(() => {
    lastScrollYRef.current = Math.max(0, window.scrollY);

    const updateMenuVisibility = () => {
      const currentScrollY = Math.max(0, window.scrollY);
      const delta = currentScrollY - lastScrollYRef.current;

      // Luôn hiện menu khi ở gần đầu trang.
      if (currentScrollY <= TOP_REVEAL_OFFSET) {
        setIsVisible(true);
        directionRef.current = null;
        accumulatedDistanceRef.current = 0;
        lastScrollYRef.current = currentScrollY;
        tickingRef.current = false;
        return;
      }

      // Bỏ qua các dao động rất nhỏ do touchpad / momentum / iOS bounce.
      if (Math.abs(delta) < DIRECTION_NOISE_THRESHOLD) {
        lastScrollYRef.current = currentScrollY;
        tickingRef.current = false;
        return;
      }

      const nextDirection = delta > 0 ? "down" : "up";

      if (directionRef.current !== nextDirection) {
        directionRef.current = nextDirection;
        accumulatedDistanceRef.current = 0;
      }

      accumulatedDistanceRef.current += Math.abs(delta);

      if (
        nextDirection === "down" &&
        currentScrollY >= HIDE_AFTER_SCROLL &&
        accumulatedDistanceRef.current >= HIDE_DISTANCE_THRESHOLD
      ) {
        setIsVisible(false);
        accumulatedDistanceRef.current = 0;
      }

      if (
        nextDirection === "up" &&
        accumulatedDistanceRef.current >= SHOW_DISTANCE_THRESHOLD
      ) {
        setIsVisible(true);
        accumulatedDistanceRef.current = 0;
      }

      lastScrollYRef.current = currentScrollY;
      tickingRef.current = false;
    };

    const handleScroll = () => {
      if (tickingRef.current) return;

      tickingRef.current = true;
      window.requestAnimationFrame(updateMenuVisibility);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleNavClick = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (pathname !== href) return;

    event.preventDefault();

    window.dispatchEvent(
      new CustomEvent("navbar-handle-nav-click", {
        detail: { href },
      })
    );
  };

  const toggleNavbarMobileMenu = () => {
    window.dispatchEvent(new Event("navbar-mobile-toggle"));
  };

  return (
    <motion.nav
      aria-label="Điều hướng mobile"
      initial={false}
      animate={{
        y: isVisible ? 0 : "calc(100% + 20px)",
      }}
      transition={
        shouldReduceMotion
          ? { duration: 0 }
          : {
              type: "tween",
              duration: isVisible ? 0.2 : 0.18,
              ease: isVisible
                ? [0.22, 1, 0.36, 1]
                : [0.4, 0, 1, 1],
            }
      }
      className="pointer-events-none fixed inset-x-0 bottom-0 z-[24] flex justify-center px-6 pb-[calc(20px+env(safe-area-inset-bottom))] will-change-transform md:hidden"
    >
      <div
        className={`group pointer-events-auto relative h-[56px] w-full max-w-xl ${
          isVisible ? "" : "pointer-events-none"
        }`}
      >
        {/*
          BACKDROP LAYER
          Không animate opacity trên layer có backdrop-blur để tránh flicker /
          tái compositing khi menu hiện lại trên mobile.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 rounded-full border border-border bg-card/70 shadow-[0_12px_36px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-[background-color,box-shadow] duration-300 group-hover:bg-card/90"
        />

        {/*
          FOREGROUND LAYER
          Chỉ foreground fade nhẹ. Backdrop layer chỉ trượt bằng transform.
        */}
        <motion.div
          initial={false}
          animate={{ opacity: isVisible ? 1 : 0 }}
          transition={
            shouldReduceMotion
              ? { duration: 0 }
              : {
                  type: "tween",
                  duration: isVisible ? 0.14 : 0.1,
                  ease: "linear",
                  delay: isVisible ? 0.025 : 0,
                }
          }
          className="relative flex h-full items-center justify-around px-1 will-change-[opacity]"
        >
        {/* ACTIVE PILL - CHỈ CHUYỂN ĐỘNG THEO TRỤC X */}
        {activeIndex >= 0 && (
          <div className="pointer-events-none absolute inset-x-1 top-[6.5px] h-[42px]">
            <motion.span
              initial={false}
              animate={{
                x: `${activeIndex * 100}%`,
              }}
              transition={{
                type: "tween",
                duration: 0.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ width: itemWidth }}
              className="block h-full rounded-full bg-foreground/10"
            />
          </div>
        )}

        {visibleMenuItems.map((item) => {
          const active = isActive(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
              onClick={(event) => handleNavClick(event, item.href)}
              className={`relative z-10 flex h-[44px] min-w-0 flex-1 flex-col items-center justify-center gap-0 ${
                active
                  ? "font-bold text-foreground"
                  : "text-foreground/50"
              }`}
            >
              <i
                className={`${active ? "fad" : "fal"} ${item.icon} relative z-10 text-lg`}
                aria-hidden="true"
              />

              <span className="relative z-10 hidden text-[11px] leading-none">
                {item.label}
              </span>
            </Link>
          );
        })}

        <button
          type="button"
          aria-label="Mở menu"
          onClick={toggleNavbarMobileMenu}
          className="relative z-10 flex h-[54px] min-w-0 flex-1 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-[27px] text-foreground/50"
        >
          <i
            className="fal fa-bars relative z-10 text-lg"
            aria-hidden="true"
          />

          <span className="relative z-10 hidden text-[11px] leading-none">
            Menu
          </span>
        </button>
        </motion.div>
      </div>
    </motion.nav>
  );
}