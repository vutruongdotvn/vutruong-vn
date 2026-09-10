import type { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { WatchAccessController } from "./watchAccessController";
import { createWatchAccessTransport } from "../../services/watch/watchAccessService";

const RUNTIME_KEY = Symbol.for("vtzone.watch.access.runtime.v1");
let channelSequence = 0;

/**
 * One live auth monitor per browser document, started only on first Watch mount.
 *
 * Route unmounts do NOT dispose it: logout/profile events must still invalidate
 * the remembered state on / or /blog. It stores no movie data or durable role.
 */
export class WatchAccessRuntime {
  readonly controller: WatchAccessController;
  private started = false;
  private unsubscribe: (() => void) | null = null;
  private channel: RealtimeChannel | null = null;
  private channelUserId: string | null = null;
  private channelEpoch = 0;
  private channelInterrupted = false;

  constructor(readonly client: SupabaseClient, private previous?: WatchAccessRuntime) {
    // Passive construction: safe for SSR and React StrictMode render replay.
    this.controller = new WatchAccessController(createWatchAccessTransport(client));
  }

  private onVisible = () => {
    if (document.visibilityState === "visible") {
      this.controller.recheckOnReturn();
    }
  };

  private onOnline = () => {
    void this.controller.recheck();
  };

  private onOffline = () => {
    this.controller.suspend("Mất kết nối mạng. Quyền Watch đang tạm khóa.");
  };

  private onPageHide = () => {
    this.controller.suspend("Cần xác minh lại quyền Watch khi quay lại trang.");
  };

  start() {
    if (this.started || typeof window === "undefined") return;

    this.previous?.destroy();
    this.previous = undefined;
    this.started = true;

    this.unsubscribe = this.controller.subscribe(this.syncChannel);
    window.addEventListener("focus", this.controller.recheckOnReturn);
    window.addEventListener("pageshow", this.controller.recheckOnReturn);
    window.addEventListener("pagehide", this.onPageHide);
    window.addEventListener("online", this.onOnline);
    window.addEventListener("offline", this.onOffline);
    document.addEventListener("visibilitychange", this.onVisible);
    this.controller.start();
    this.syncChannel();
  }

  private syncChannel = () => {
    if (!this.started) return;
    const userId = this.controller.getSnapshot().userId;
    if (userId === this.channelUserId) return;
    this.detachChannel();
    this.channelUserId = userId;
    if (!userId) return;
    const epoch = this.channelEpoch;
    const current = () => this.started && this.channelEpoch === epoch
      && this.controller.getSnapshot().userId === userId;

    this.channel = this.client.channel(`watch-access-${++channelSequence}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        payload => {
          if (current()) {
            this.controller.profileChanged(payload.new.status);
          }
        },
      );

    this.channel.subscribe(status => {
      if (!current()) return;

      if (status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED") {
        this.channelInterrupted = true;

        // Never keep a trusted snapshot after a detected gap in monitoring.
        this.controller.suspend("Kết nối theo dõi quyền bị gián đoạn. Cần xác minh lại tài khoản.");
        return;
      }

      if (status === "SUBSCRIBED" && this.channelInterrupted) {
        this.channelInterrupted = false;

        // A successful reconnect is an explicit event, not a retry loop.
        void this.controller.recheck();
      }
    });
  };

  private detachChannel() {
    this.channelEpoch += 1;
    const old = this.channel;

    this.channel = null;
    this.channelUserId = null;
    this.channelInterrupted = false;

    if (old) {
      void this.client.removeChannel(old).catch(() => {});
    }
  }

  /**
   * Used only when the Supabase client is replaced (for example HMR) or in tests.
   * Ordinary provider cleanup must NOT call this method.
   */
  destroy() {
    if (!this.started) return;

    this.started = false;
    this.unsubscribe?.();
    this.unsubscribe = null;

    this.detachChannel();
    window.removeEventListener("focus", this.controller.recheckOnReturn);
    window.removeEventListener("pageshow", this.controller.recheckOnReturn);
    window.removeEventListener("pagehide", this.onPageHide);
    window.removeEventListener("online", this.onOnline);
    window.removeEventListener("offline", this.onOffline);
    document.removeEventListener("visibilitychange", this.onVisible);
    this.controller.stop();
  }
}

export function getWatchAccessRuntime(client: SupabaseClient): WatchAccessRuntime {
  // Never share identity across server renders/requests.
  if (typeof window === "undefined") {
    return new WatchAccessRuntime(client);
  }

  const host = window as unknown as { [key: symbol]: WatchAccessRuntime | undefined };
  const old = host[RUNTIME_KEY];

  if (old?.client === client) {
    return old;
  }

  // Window-owned slot avoids duplicate listeners on provider/HMR remounts.
  // Network/listener work still starts only in the provider effect.
  const runtime = new WatchAccessRuntime(client, old);
  host[RUNTIME_KEY] = runtime;
  return runtime;
}
