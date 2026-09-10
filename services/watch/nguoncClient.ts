import { waitForWatchOperation } from "../../lib/watch/watchAccessController";
import { watchLatestUrl, watchMovieUrl, watchCollectionUrl } from "../../lib/watch/nguoncEndpoints";
import { normalizeWatchLatest, normalizeWatchMovie } from "../../lib/watch/normalizeNguonc";
import { WatchApiError, type WatchLatestPage, type WatchMovieSummary, type WatchCollectionSource } from "../../types/watchApi";
import type { WatchAccessPermit } from "../../types/watchAccess";

type Scope = Pick<WatchAccessPermit, "userId" | "revision" | "accessKind">;
type Entry<T = unknown> = {
  controller: AbortController;
  promise: Promise<T>;
  consumers: number;
  settled: boolean;
};
type Waiter = { grant: () => void };
type Options = {
  fetch?: typeof fetch;
  requestTimeoutMs?: number;
  verificationTimeoutMs?: number;
  queueTimeoutMs?: number;
};

const MAX_ACTIVE = 3;
const MAX_QUEUED = 20;
const MAX_BODY_BYTES = 2 * 1024 * 1024;
const cancelled = () => new WatchApiError("cancelled");

/** One browser client per authorized Watch scope. No completed-response cache.
 * Construction/import/render never fetches. start/stop supports effect replay.
 * Only the access provider owns Auth, RPC, refresh and realtime subscriptions.
 */
export class WatchNguoncClient {
  private readonly scope: Readonly<Scope>;
  private active = false;
  private epoch = 0;
  private running = 0;
  private queue: Waiter[] = [];
  private entries = new Map<string, Entry>();
  private permitSignal: AbortSignal | null = null;
  private detachPermit: (() => void) | null = null;
  private retryAt = 0;

  constructor(
    scope: Scope,
    private readonly requireAccess: () => Promise<WatchAccessPermit>,
    private readonly options: Options = {},
  ) {
    this.scope = Object.freeze({ ...scope });
  }

  start() {
    if (this.active) return;
    this.active = true;
    this.epoch += 1;
  }

  stop = () => {
    this.active = false;
    this.epoch += 1;
    this.detachPermit?.();
    this.detachPermit = null;
    this.permitSignal = null;
    for (const entry of this.entries.values()) entry.controller.abort(cancelled());
    this.entries.clear();
    this.queue = [];
    this.running = 0;
    this.retryAt = 0;
  };

  latest(page = 1, consumerSignal?: AbortSignal): Promise<WatchLatestPage> {
    try { return this.request(watchLatestUrl(page), value => normalizeWatchLatest(value, page), consumerSignal); }
    catch (error) { return Promise.reject(error); }
  }

  detail(slug: string, consumerSignal?: AbortSignal): Promise<WatchMovieSummary> {
    try { return this.request(watchMovieUrl(slug), value => normalizeWatchMovie(value, slug), consumerSignal); }
    catch (error) { return Promise.reject(error); }
  }

  collection(source: WatchCollectionSource, page = 1, consumerSignal?: AbortSignal): Promise<WatchLatestPage> {
    try { return this.request(watchCollectionUrl(source, page), value => normalizeWatchLatest(value, page), consumerSignal); }
    catch (error) { return Promise.reject(error); }
  }

  private request<T>(url: string, normalize: (value: unknown) => T, consumerSignal?: AbortSignal): Promise<T> {
    try {
      if (typeof window === "undefined") throw new WatchApiError("browser_only");
      if (!this.active) throw new WatchApiError("inactive");
      if (consumerSignal?.aborted) throw cancelled();
      this.assertCooldown();
      // Endpoint builders fix each URL's result type. The untyped map is internal;
      // external JSON still passes runtime normalization before any consumer.
      let entry = this.entries.get(url) as Entry<T> | undefined;
      if (entry?.controller.signal.aborted) entry = undefined;
      if (!entry) {
        if (this.entries.size >= MAX_ACTIVE + MAX_QUEUED) throw new WatchApiError("busy");
        const controller = new AbortController();
        const epoch = this.epoch;
        const created: Entry<T> = { controller, consumers: 0, settled: false, promise: undefined! };
        // Defer work so the first consumer and dedupe entry exist before it runs.
        created.promise = Promise.resolve().then(() => this.perform(url, normalize, controller, epoch))
          .finally(() => {
            created.settled = true;
            if (this.entries.get(url) === created) this.entries.delete(url);
          });
        // A caller may cancel before the operation settles; never leak a rejection.
        void created.promise.catch(() => undefined);
        this.entries.set(url, created);
        entry = created;
      }
      return this.consume(entry, consumerSignal);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  private consume<T>(entry: Entry<T>, signal?: AbortSignal): Promise<T> {
    entry.consumers += 1;
    return new Promise((resolve, reject) => {
      let done = false;
      const finish = (error: unknown, value?: T) => {
        if (done) return;
        done = true;
        signal?.removeEventListener("abort", onAbort);
        entry.consumers -= 1;
        if (entry.consumers === 0 && !entry.settled) entry.controller.abort(cancelled());
        if (error) reject(error); else resolve(value!);
      };
      const onAbort = () => finish(cancelled());
      signal?.addEventListener("abort", onAbort, { once: true });
      if (signal?.aborted) onAbort();
      entry.promise.then(value => finish(null, value), error => finish(error));
    });
  }

  private assertCurrent(signal: AbortSignal, epoch: number) {
    if (signal.aborted) throw signal.reason ?? cancelled();
    if (!this.active || this.epoch !== epoch) throw cancelled();
  }

  private assertCooldown() {
    if (Date.now() < this.retryAt) throw new WatchApiError("rate_limited", { status: 429, retryAt: this.retryAt });
  }

  private bindPermit(permit: WatchAccessPermit, signal: AbortSignal, epoch: number) {
    this.assertCurrent(signal, epoch);
    if (!permit || permit.userId !== this.scope.userId || permit.revision !== this.scope.revision
      || permit.accessKind !== this.scope.accessKind
      || (permit.accessKind !== "admin" && permit.accessKind !== "approved_user")
      || !permit.signal || permit.signal.aborted
      || (this.permitSignal !== null && this.permitSignal !== permit.signal)) {
      throw new WatchApiError("access_denied");
    }
    if (this.permitSignal === null) {
      this.permitSignal = permit.signal;
      permit.signal.addEventListener("abort", this.stop, { once: true });
      this.detachPermit = () => permit.signal.removeEventListener("abort", this.stop);
    }
  }

  private acquire(signal: AbortSignal, epoch: number): Promise<() => void> {
    this.assertCurrent(signal, epoch);
    if (this.running < MAX_ACTIVE) return Promise.resolve(this.takeSlot(epoch));
    if (this.queue.length >= MAX_QUEUED) return Promise.reject(new WatchApiError("busy"));
    return new Promise((resolve, reject) => {
      const remove = () => {
        clearTimeout(timeout);
        signal.removeEventListener("abort", onAbort);
        this.queue = this.queue.filter(item => item !== waiter);
      };
      const onAbort = () => { remove(); reject(signal.reason ?? cancelled()); };
      const waiter: Waiter = { grant: () => {
        remove();
        try { this.assertCurrent(signal, epoch); resolve(this.takeSlot(epoch)); }
        catch (error) { reject(error); }
      } };
      const timeout = setTimeout(() => { remove(); reject(new WatchApiError("queue_timeout")); },
        this.options.queueTimeoutMs ?? 30_000);
      signal.addEventListener("abort", onAbort, { once: true });
      this.queue.push(waiter);
    });
  }

  private takeSlot(epoch: number): () => void {
    this.running += 1;
    return () => {
      if (epoch !== this.epoch) return;
      this.running -= 1;
      while (this.active && this.running < MAX_ACTIVE && this.queue.length) this.queue[0].grant();
    };
  }

  private async perform<T>(url: string, normalize: (value: unknown) => T, controller: AbortController, epoch: number): Promise<T> {
    const signal = controller.signal;
    const release = await this.acquire(signal, epoch);
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      this.assertCurrent(signal, epoch);
      this.assertCooldown();
      timer = setTimeout(() => controller.abort(new WatchApiError("timeout")),
        this.options.verificationTimeoutMs ?? 13_000);
      let permit: WatchAccessPermit;
      try {
        // Runs AFTER queue admission, and again for every new GET. No cached grant.
        permit = await waitForWatchOperation(this.requireAccess(), signal);
      } catch (error) {
        if (signal.aborted) throw signal.reason ?? cancelled();
        throw error instanceof WatchApiError ? error : new WatchApiError("access_denied");
      }
      clearTimeout(timer);
      this.bindPermit(permit, signal, epoch);
      this.assertCurrent(signal, epoch);
      this.assertCooldown();
      timer = setTimeout(() => controller.abort(new WatchApiError("timeout")),
        this.options.requestTimeoutMs ?? 12_000);
      // No await between the final checks and this one movie-data fetch site.
      const response = await waitForWatchOperation((this.options.fetch ?? fetch)(url, {
        method: "GET", mode: "cors", credentials: "omit", redirect: "error",
        referrerPolicy: "no-referrer", cache: "no-store",
        headers: { Accept: "application/json" }, signal,
      }), signal);
      this.assertCurrent(signal, epoch);
      if (response.status === 429) {
        this.retryAt = Math.max(this.retryAt, parseRetryAt(response.headers.get("Retry-After")));
        void response.body?.cancel().catch(() => undefined);
        throw new WatchApiError("rate_limited", { status: 429, retryAt: this.retryAt });
      }
      if (!response.ok) {
        void response.body?.cancel().catch(() => undefined);
        throw new WatchApiError("http_error", { status: response.status });
      }
      const value = await readJson(response, signal);
      this.assertCurrent(signal, epoch);
      return normalize(value);
    } catch (error) {
      if (signal.aborted) throw signal.reason ?? cancelled();
      if (error instanceof WatchApiError) throw error;
      throw new WatchApiError("transport");
    } finally {
      clearTimeout(timer);
      release();
    }
  }
}

function parseRetryAt(value: string | null): number {
  const now = Date.now();
  if (value && /^\d+$/.test(value.trim())) {
    const seconds = Number(value.trim());
    if (Number.isSafeInteger(seconds) && seconds < 315_360_000) return now + seconds * 1_000;
  }
  const date = value ? Date.parse(value) : NaN;
  return Number.isFinite(date) && date > now ? date : now + 60_000;
}

async function readJson(response: Response, signal: AbortSignal): Promise<unknown> {
  const contentType = response.headers.get("Content-Type")?.split(";")[0].trim().toLowerCase();
  if (contentType !== "application/json" && !/^application\/[\w.+-]+\+json$/.test(contentType ?? "")) {
    void response.body?.cancel().catch(() => undefined);
    throw new WatchApiError("invalid_response", { field: "Content-Type" });
  }
  const reader = response.body?.getReader();
  if (!reader) throw new WatchApiError("invalid_response", { field: "body" });
  const cancel = () => { void reader.cancel().catch(() => undefined); };
  signal.addEventListener("abort", cancel, { once: true });
  let complete = false;
  try {
    const decoder = new TextDecoder("utf-8", { fatal: true });
    let size = 0;
    const parts: string[] = [];
    while (true) {
      if (signal.aborted) throw signal.reason ?? cancelled();
      const chunk = await waitForWatchOperation(reader.read(), signal);
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > MAX_BODY_BYTES) throw new WatchApiError("response_too_large");
      parts.push(decoder.decode(chunk.value, { stream: true }));
    }
    parts.push(decoder.decode());
    const value: unknown = JSON.parse(parts.join(""));
    complete = true;
    return value;
  } catch (error) {
    if (signal.aborted) throw signal.reason ?? cancelled();
    if (error instanceof WatchApiError) throw error;
    throw new WatchApiError("invalid_response", { field: "JSON/body" });
  } finally {
    signal.removeEventListener("abort", cancel);
    if (!complete) cancel();
    reader.releaseLock();
  }
}
