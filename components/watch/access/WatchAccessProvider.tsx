"use client";

import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { WatchAccessController } from "@/lib/watch/watchAccessController";
import { createWatchAccessTransport } from "@/services/watch/watchAccessService";
import type { WatchAccessDecision, WatchAccessPermit, WatchAccessState } from "@/types/watchAccess";

type WatchAccessContextValue = WatchAccessState & {
  recheck: () => Promise<WatchAccessDecision | null>;
  requireAccess: () => Promise<WatchAccessPermit>;
};

const WatchAccessContext = createContext<WatchAccessContextValue | null>(null);
let channelSequence = 0;

export default function WatchAccessProvider({ children }: { children: ReactNode }) {
  const [controller] = useState(() => new WatchAccessController(createWatchAccessTransport(supabase)));
  const state = useSyncExternalStore(controller.subscribe, controller.getSnapshot, controller.getServerSnapshot);

  useEffect(() => {
    controller.start();
    const onVisible = () => {
      if (document.visibilityState === "visible") controller.recheckOnReturn();
    };
    const onOnline = () => { void controller.recheck(); };
    const onOffline = () => controller.suspend("Mất kết nối mạng. Quyền Watch đang tạm khóa.");
    const onPageHide = () => controller.suspend("Cần xác minh lại quyền Watch khi quay lại trang.");
    window.addEventListener("focus", controller.recheckOnReturn);
    window.addEventListener("pageshow", controller.recheckOnReturn);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.removeEventListener("focus", controller.recheckOnReturn);
      window.removeEventListener("pageshow", controller.recheckOnReturn);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      document.removeEventListener("visibilitychange", onVisible);
      controller.stop();
    };
  }, [controller]);

  useEffect(() => {
    if (!state.userId) return;
    const watchedUserId = state.userId;
    const channel = supabase.channel(`watch-access-${++channelSequence}`)
      .on("postgres_changes", {
        event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${state.userId}`,
      }, (payload) => {
        if (controller.getSnapshot().userId === watchedUserId) controller.profileChanged(payload.new.status);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [controller, state.userId]);

  const value = useMemo(() => ({ ...state, recheck: controller.recheck, requireAccess: controller.requireAccess }), [state, controller]);
  return <WatchAccessContext.Provider value={value}>{children}</WatchAccessContext.Provider>;
}

export function useWatchAccess() {
  const value = useContext(WatchAccessContext);
  if (!value) throw new Error("useWatchAccess phải nằm trong WatchAccessProvider.");
  return value;
}
