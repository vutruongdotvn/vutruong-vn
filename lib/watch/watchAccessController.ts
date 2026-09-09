import type {
  WatchAccessDecision, WatchAccessPermit, WatchAccessState,
  WatchAccessTransport, WatchSession, WatchUserStatus,
} from "../../types/watchAccess";

export const WATCH_INITIAL_ACCESS: WatchAccessState = Object.freeze({
  phase: "checking", userId: null, accessKind: null, status: "unknown",
  isChecking: false, checkedAt: null, revision: 0, error: null,
});

export class WatchAccessError extends Error {
  constructor(public readonly code: "session_invalid" | "rpc_missing" | "unavailable" | "invalid_response") {
    super(code);
    this.name = "WatchAccessError";
  }
}

/** Stop waiting even when an Auth SDK operation cannot physically be aborted. */
export function waitForWatchOperation<T>(operation: PromiseLike<T>, signal: AbortSignal): Promise<T> {
  return new Promise((resolve, reject) => {
    const abort = () => reject(signal.reason ?? new DOMException("Cancelled", "AbortError"));
    if (signal.aborted) abort();
    else signal.addEventListener("abort", abort, { once: true });
    Promise.resolve(operation).then(
      (value) => { signal.removeEventListener("abort", abort); if (!signal.aborted) resolve(value); },
      (error) => { signal.removeEventListener("abort", abort); reject(error); },
    );
  });
}

/** One controller per Watch provider. Construction never starts network work. */
export class WatchAccessController {
  private state: WatchAccessState = WATCH_INITIAL_ACCESS;
  private listeners = new Set<() => void>();
  private active = false;
  private version = 0;
  private observedSession: WatchSession | null | undefined;
  private unsubscribe: (() => void) | null = null;
  private scheduled: ReturnType<typeof setTimeout> | null = null;
  private heartbeat: ReturnType<typeof setTimeout> | null = null;
  private permitAbort = new AbortController();
  private pending: {
    controller: AbortController;
    promise: Promise<WatchAccessDecision | null>;
  } | null = null;

  constructor(
    private readonly transport: WatchAccessTransport,
    private readonly options: { timeoutMs?: number; heartbeatMs?: number } = {},
  ) {}

  getSnapshot = () => this.state;
  getServerSnapshot = () => WATCH_INITIAL_ACCESS;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  private update(next: Partial<WatchAccessState>) {
    this.state = { ...this.state, ...next };
    this.listeners.forEach((listener) => listener());
  }

  private clearTimers() {
    if (this.scheduled !== null) clearTimeout(this.scheduled);
    if (this.heartbeat !== null) clearTimeout(this.heartbeat);
    this.scheduled = null;
    this.heartbeat = null;
  }

  private cancelCheck() {
    this.version += 1;
    this.pending?.controller.abort();
    this.pending = null;
  }

  private revokePermit() {
    this.permitAbort.abort();
    this.permitAbort = new AbortController();
    this.state = { ...this.state, revision: this.state.revision + 1 };
  }

  private schedule() {
    if (!this.active || this.scheduled !== null) return;
    // Defer outside the auth callback; Strict Mode cleanup cancels initial work.
    this.scheduled = setTimeout(() => {
      this.scheduled = null;
      void this.recheck();
    }, 0);
  }

  private onSession = (session: WatchSession | null) => {
    if (!this.active) return;
    const previous = this.observedSession;
    this.observedSession = session;

    if (!session) {
      this.clearTimers();
      this.cancelCheck();
      this.revokePermit();
      this.update({ phase: "anonymous", userId: null, accessKind: null, status: "unknown",
        isChecking: false, checkedAt: Date.now(), error: null });
      return;
    }

    if (previous?.userId === session.userId && previous.accessToken === session.accessToken) return;

    this.clearTimers();
    this.cancelCheck();
    if (this.state.userId !== session.userId) {
      this.revokePermit();
      this.update({ phase: "checking", userId: null, accessKind: null,
        status: "unknown", isChecking: false, checkedAt: null, error: null });
    }
    this.schedule();
  };

  start() {
    if (this.active) return;
    this.active = true;
    this.unsubscribe = this.transport.subscribe(this.onSession);
    this.schedule();
  }

  stop() {
    this.active = false;
    this.clearTimers();
    this.unsubscribe?.();
    this.unsubscribe = null;
    this.cancelCheck();
    this.revokePermit();
    this.observedSession = undefined;
    this.update({ ...WATCH_INITIAL_ACCESS, revision: this.state.revision });
  }

  /** No retry loop: an error stops the heartbeat until an explicit event/retry. */
  suspend(message = "Không thể xác minh quyền Watch. Vui lòng thử lại.") {
    if (!this.active) return;
    this.clearTimers();
    this.cancelCheck();
    this.revokePermit();
    this.update({ phase: "error", accessKind: null, status: "unknown", isChecking: false, error: message });
  }

  profileChanged(rawStatus: unknown) {
    if (!this.active || this.state.accessKind === "admin") return;
    const status = typeof rawStatus === "string" ? rawStatus.trim().toLowerCase() : "unknown";
    if (status === this.state.status) return;
    // Events can close access immediately, but can never grant access themselves.
    this.clearTimers();
    this.cancelCheck();
    this.revokePermit();
    this.update({ phase: "checking", accessKind: null, status: "unknown", isChecking: false });
    this.schedule();
  }

  recheckOnReturn = () => {
    if (!this.active) return;
    // focus and pageshow often fire together; coalesce already-completed checks too.
    if (this.state.phase !== "error" && this.state.phase !== "checking"
      && this.state.checkedAt !== null && Date.now() - this.state.checkedAt < 1_000) return;
    void this.recheck();
  };

  recheck = (): Promise<WatchAccessDecision | null> => {
    if (!this.active) return Promise.resolve(null);
    if (this.pending) return this.pending.promise;
    this.clearTimers();
    const controller = new AbortController();
    const version = this.version;
    const stillCurrent = () => this.active && this.version === version && !controller.signal.aborted;
    this.update({ isChecking: true, error: null });
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort(new DOMException("Watch verification timed out", "TimeoutError"));
    }, this.options.timeoutMs ?? 12_000);

    // Begin in a microtask so pending is assigned before any transport can finish.
    const promise = Promise.resolve().then(async () => {
      try {
        if (!stillCurrent()) return null;
        const session = await waitForWatchOperation(this.transport.readSession(controller.signal), controller.signal);
        if (!stillCurrent()) return null;
        if (!session) {
          this.observedSession = null;
          this.revokePermit();
          this.update({ phase: "anonymous", userId: null, accessKind: null, status: "unknown",
            isChecking: false, checkedAt: Date.now(), error: null });
          return null;
        }
        this.observedSession = session;
        if (this.state.userId !== null && this.state.userId !== session.userId) {
          this.revokePermit();
          this.update({ phase: "checking", userId: null, accessKind: null, status: "unknown" });
        }
        const result = await waitForWatchOperation(this.transport.verify(session, controller.signal), controller.signal);
        if (!stillCurrent()) return null;
        if (!result.allowed || this.state.userId !== result.userId || this.state.accessKind !== result.accessKind) {
          this.revokePermit();
        }
        this.update({ phase: result.allowed ? "allowed" : "denied", userId: result.userId,
          accessKind: result.accessKind, status: result.status, isChecking: false,
          checkedAt: Date.now(), error: null });
        if (result.allowed) {
          this.heartbeat = setTimeout(() => {
            this.heartbeat = null;
            void this.recheck();
          }, this.options.heartbeatMs ?? 60_000);
        }
        return result;
      } catch (error) {
        if (!this.active || this.version !== version) return null;
        this.revokePermit();
        const invalidSession = error instanceof WatchAccessError && error.code === "session_invalid";
        const message = timedOut
          ? "Xác minh quyền quá thời gian chờ. Vui lòng thử lại."
          : error instanceof WatchAccessError && error.code === "rpc_missing"
            ? "Chưa có hàm get_watch_access trong Supabase đang kết nối."
            : invalidSession ? "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."
              : "Không thể xác minh quyền Watch. Vui lòng thử lại.";
        this.update({ phase: invalidSession ? "anonymous" : "error", accessKind: null,
          userId: invalidSession ? null : this.state.userId, status: "unknown",
          isChecking: false, error: message });
        return null;
      } finally {
        clearTimeout(timeout);
        if (this.pending?.controller === controller) this.pending = null;
      }
    });
    this.pending = { controller, promise };
    return promise;
  };

  requireAccess = async (): Promise<WatchAccessPermit> => {
    const version = this.version;
    const result = await this.recheck();
    if (!result?.allowed || !this.active || version !== this.version || this.state.phase !== "allowed"
      || this.state.userId !== result.userId || !this.state.accessKind) {
      throw new WatchAccessError("unavailable");
    }
    return { userId: result.userId, accessKind: this.state.accessKind,
      revision: this.state.revision, signal: this.permitAbort.signal };
  };
}

const STATUSES = new Set<WatchUserStatus>(["approved", "pending", "banned", "rejected", "revoked", "unknown"]);

/** Treat every RPC body as untrusted data; never coerce strings to booleans. */
export function parseWatchAccess(value: unknown, expectedUserId: string): WatchAccessDecision {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new WatchAccessError("invalid_response");
  const row = value as Record<string, unknown>;
  if (row.version !== 1 || row.user_id !== expectedUserId || typeof row.allowed !== "boolean"
    || typeof row.status !== "string" || !STATUSES.has(row.status as WatchUserStatus)) {
    throw new WatchAccessError("invalid_response");
  }
  const accessKind = row.access_kind;
  if (row.allowed) {
    if ((accessKind !== "admin" && accessKind !== "approved_user") || row.status !== "approved") {
      throw new WatchAccessError("invalid_response");
    }
  } else if (accessKind !== null || row.status === "approved") {
    throw new WatchAccessError("invalid_response");
  }
  return { userId: expectedUserId, allowed: row.allowed,
    accessKind: row.allowed ? accessKind as "admin" | "approved_user" : null,
    status: row.status as WatchUserStatus };
}
