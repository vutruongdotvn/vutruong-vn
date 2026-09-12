"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";
import { getWatchAccessRuntime } from "@/lib/watch/watchAccessRuntime";
import type { WatchAccessDecision, WatchAccessPermit, WatchAccessState } from "@/types/watchAccess";

type WatchAccessContextValue = WatchAccessState & {
  recheck: () => Promise<WatchAccessDecision | null>;
  requireAccess: () => Promise<WatchAccessPermit>;
};

const WatchAccessContext = createContext<WatchAccessContextValue | null>(null);

export default function WatchAccessProvider({ children }: { children: ReactNode }) {
  const [runtime] = useState(() => getWatchAccessRuntime(supabase));
  const controller = runtime.controller;
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);

  // Route-scoped: leaving /watch releases the Auth listener, Realtime channel
  // and timers. Returning starts from a clean state and verifies once again.
  useEffect(() => {
    runtime.start();
    // Returning after a genuine verification error may retry once. Known
    // allowed/denied/anonymous states are not reset or rechecked by navigation.
    if (controller.getSnapshot().phase === "error") {
      controller.recheckOnReturn();
    }
    return () => runtime.stop();
  }, [runtime, controller]);

  const value = useMemo(
    () => ({
      ...state,
      recheck: controller.recheck,
      requireAccess: controller.requireAccess,
    }),
    [state, controller],
  );

  return <WatchAccessContext.Provider value={value}>{children}</WatchAccessContext.Provider>;
}

export function useWatchAccess() {
  const value = useContext(WatchAccessContext);

  if (!value) {
    throw new Error("useWatchAccess phải nằm trong WatchAccessProvider.");
  }

  return value;
}
