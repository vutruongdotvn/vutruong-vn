"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { usePathname, useSearchParams } from "next/navigation";

type ProgressPhase = "idle" | "loading" | "finishing";

const MIN_VISIBLE_MS = 280;
const EXIT_DURATION_MS = 180;
const SAFETY_TIMEOUT_MS = 10_000;

function normalizePathname(pathname: string) {
  return pathname.replace(/\/+$/, "") || "/";
}

function getInternalDestination(event: MouseEvent) {
  if (
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey
  ) {
    return null;
  }

  const target = event.target;

  if (!(target instanceof Element)) {
    return null;
  }

  const anchor = target.closest<HTMLAnchorElement>("a[href]");

  if (
    !anchor ||
    anchor.hasAttribute("download") ||
    anchor.hasAttribute("data-no-route-progress") ||
    anchor.getAttribute("aria-disabled") === "true" ||
    (anchor.target && anchor.target !== "_self") ||
    anchor.relList.contains("external")
  ) {
    return null;
  }

  let destination: URL;

  try {
    destination = new URL(anchor.href, window.location.href);
  } catch {
    return null;
  }

  if (
    destination.protocol !== window.location.protocol ||
    destination.origin !== window.location.origin
  ) {
    return null;
  }

  const current = new URL(window.location.href);
  const isSameRoute =
    normalizePathname(destination.pathname) ===
      normalizePathname(current.pathname) &&
    destination.search === current.search;

  // Same-route refreshes and hash-only jumps are handled by their own UI.
  return isSameRoute ? null : destination;
}

export default function RouteChangeIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const reduceMotion = useReducedMotion();

  const [phase, setPhase] = useState<ProgressPhase>("idle");
  const phaseRef = useRef<ProgressPhase>("idle");
  const startedAtRef = useRef(0);
  const finishTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);

  const routeKey = `${pathname}?${searchParams.toString()}`;
  const previousRouteKeyRef = useRef(routeKey);

  const updatePhase = useCallback((nextPhase: ProgressPhase) => {
    phaseRef.current = nextPhase;
    setPhase(nextPhase);
  }, []);

  const clearFinishTimer = useCallback(() => {
    if (finishTimerRef.current !== null) {
      window.clearTimeout(finishTimerRef.current);
      finishTimerRef.current = null;
    }
  }, []);

  const clearSafetyTimer = useCallback(() => {
    if (safetyTimerRef.current !== null) {
      window.clearTimeout(safetyTimerRef.current);
      safetyTimerRef.current = null;
    }
  }, []);

  const startProgress = useCallback(() => {
    clearFinishTimer();
    clearSafetyTimer();

    startedAtRef.current = performance.now();
    updatePhase("loading");

    // Prevent a cancelled navigation from leaving the indicator visible.
    safetyTimerRef.current = window.setTimeout(() => {
      updatePhase("idle");
      safetyTimerRef.current = null;
    }, SAFETY_TIMEOUT_MS);
  }, [clearFinishTimer, clearSafetyTimer, updatePhase]);

  const finishProgress = useCallback(() => {
    if (phaseRef.current === "idle") return;

    clearFinishTimer();
    clearSafetyTimer();

    const elapsed = performance.now() - startedAtRef.current;
    const remaining = Math.max(MIN_VISIBLE_MS - elapsed, 0);

    finishTimerRef.current = window.setTimeout(() => {
      updatePhase("finishing");

      finishTimerRef.current = window.setTimeout(() => {
        updatePhase("idle");
        finishTimerRef.current = null;
      }, EXIT_DURATION_MS);
    }, remaining);
  }, [clearFinishTimer, clearSafetyTimer, updatePhase]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      if (getInternalDestination(event)) {
        startProgress();
      }
    };

    // Capture phase runs before Next handles the Link navigation.
    document.addEventListener("click", handleDocumentClick, true);

    return () => {
      document.removeEventListener("click", handleDocumentClick, true);
    };
  }, [startProgress]);

  useEffect(() => {
    if (previousRouteKeyRef.current === routeKey) return;

    previousRouteKeyRef.current = routeKey;
    finishProgress();
  }, [routeKey, finishProgress]);

  useEffect(() => {
    return () => {
      clearFinishTimer();
      clearSafetyTimer();
    };
  }, [clearFinishTimer, clearSafetyTimer]);

  return (
    <AnimatePresence>
      {phase !== "idle" && (
        <motion.div
          key="route-change-indicator"
          role="progressbar"
          aria-label="Đang chuyển trang"
          className="pointer-events-none fixed inset-x-0 top-0 z-[100] h-[3px] overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.15 }}
        >
          <motion.div
            className="h-full origin-left bg-primary shadow-[0_0_10px_rgba(59,130,246,0.65)]"
            initial={{ scaleX: 0.08 }}
            animate={{
              scaleX: phase === "loading" ? 0.82 : 1,
            }}
            transition={
              phase === "loading"
                ? {
                    duration: reduceMotion ? 0 : 4,
                    ease: "easeOut",
                  }
                : {
                    duration: reduceMotion ? 0 : 0.18,
                    ease: "easeOut",
                  }
            }
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}