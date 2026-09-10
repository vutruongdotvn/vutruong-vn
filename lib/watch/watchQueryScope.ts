import { QueryClient, queryOptions } from "@tanstack/react-query";
import { WatchNguoncClient } from "../../services/watch/nguoncClient";
import { WatchApiError, type WatchCollectionSource } from "../../types/watchApi";
import type { WatchAccessPermit } from "../../types/watchAccess";
import { watchLatestUrl, watchMovieUrl, watchCollectionUrl } from "./nguoncEndpoints";
import { waitForWatchOperation } from "./watchAccessController";
import { watchQueryKeys, type WatchQueryIdentity } from "./watchQueryKeys";

export const WATCH_QUERY_POLICY = Object.freeze({
  listStaleMs: 5 * 60_000,
  inactiveGcMs: 10 * 60_000,
  playbackGcMs: 2 * 60_000,
  maxInactiveQueries: 32,
});

type Lifecycle = { ready: boolean; epoch: number };
const INITIAL: Lifecycle = Object.freeze({ ready: false, epoch: 0 });
type Options = {
  api?: ConstructorParameters<typeof WatchNguoncClient>[2];
  policy?: Partial<typeof WATCH_QUERY_POLICY>;
};

/** One RAM-only QueryClient per authorized Watch subtree. No global singleton.
 * No Auth listener, polling, persistence, fetch or React work in construction.
 */
export class WatchQueryScope {
  readonly queryClient: QueryClient;
  private readonly identity: Readonly<WatchQueryIdentity>;
  private readonly api: WatchNguoncClient;
  private readonly policy: typeof WATCH_QUERY_POLICY;
  private state: Lifecycle = INITIAL;
  private listeners = new Set<() => void>();
  private permitSignal: AbortSignal | null = null;
  private detachPermit: (() => void) | null = null;
  private detachCache: (() => void) | null = null;
  private pruneScheduled = false;
  private readonly verifyAccess: () => Promise<WatchAccessPermit>;
  private pendingMedia = new Set<AbortController>();

  constructor(identity: WatchQueryIdentity, requireAccess: () => Promise<WatchAccessPermit>, options: Options = {}) {
    this.identity = Object.freeze({ ...identity });
    this.policy = { ...WATCH_QUERY_POLICY, ...options.policy };
    this.queryClient = new QueryClient({ defaultOptions: { queries: {
      staleTime: this.policy.listStaleMs,
      gcTime: this.policy.inactiveGcMs,
      retry: false,
      retryOnMount: false,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      // Do not park failed attempts in an offline queue for automatic resumption.
      // Every real request still waits for B1/A1 authorization.
      networkMode: "always",
      throwOnError: false,
    } } });
    this.verifyAccess = async () => {
      const epoch = this.state.epoch;
      this.assertReady(epoch);
      const permit = await requireAccess();
      this.assertReady(epoch);
      this.observePermit(permit);
      return permit;
    };
    this.api = new WatchNguoncClient(identity, this.verifyAccess, options.api);
  }

  getSnapshot = () => this.state;
  getServerSnapshot = () => INITIAL;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  };

  start() {
    if (typeof window === "undefined" || this.state.ready) return;
    this.api.start();
    this.detachCache = this.queryClient.getQueryCache().subscribe(event => {
      if (event.type === "updated" || event.type === "observerRemoved") this.schedulePrune();
    });
    this.state = { ready: true, epoch: this.state.epoch + 1 };
    this.listeners.forEach(listener => listener());
  }

  stop = () => {
    this.state = { ready: false, epoch: this.state.epoch + 1 };
    this.detachPermit?.(); this.detachPermit = null; this.permitSignal = null;
    this.detachCache?.(); this.detachCache = null;
    for (const controller of this.pendingMedia) controller.abort(new WatchApiError("cancelled"));
    this.pendingMedia.clear();
    this.api.stop();
    // Cancellation and clear start synchronously. Old query functions also check
    // epoch after awaiting, so a late response cannot refill this cache.
    void this.queryClient.cancelQueries({}, { silent: true });
    this.queryClient.clear();
    this.listeners.forEach(listener => listener());
  };

  latestOptions(page = 1) {
    watchLatestUrl(page); // Validate before creating a cache entry.
    const epoch = this.state.epoch;
    return queryOptions({
      queryKey: watchQueryKeys.latest(this.identity, epoch, page),
      staleTime: this.policy.listStaleMs,
      gcTime: this.policy.inactiveGcMs,
      queryFn: async ({ signal }) => {
        this.assertReady(epoch);
        // Consume Query's signal: removing the last observer cancels its B1 lease.
        const data = await this.api.latest(page, signal);
        this.assertReady(epoch);
        return data;
      },
    });
  }

  detailOptions(slug: string) {
    watchMovieUrl(slug);
    const epoch = this.state.epoch;
    return queryOptions({
      queryKey: watchQueryKeys.detail(this.identity, epoch, slug),
      // A featured selection stays stable for this cache lifetime. Swiper, theme,
      // focus and remount never initiate a background detail refresh.
      staleTime: Infinity,
      gcTime: this.policy.inactiveGcMs,
      refetchOnMount: false,
      queryFn: async ({ signal }) => {
        this.assertReady(epoch);
        const data = await this.api.detail(slug, signal);
        this.assertReady(epoch);
        return data;
      },
    });
  }

  /**
   * Player URLs are fetched only after an episode route mounts. They stay in
   * authorized RAM briefly so switching episodes does not refetch the manifest.
   * stop()/revoke still cancels and clears them synchronously.
   */
  playbackOptions(slug: string) {
    watchMovieUrl(slug);
    const epoch = this.state.epoch;

    return queryOptions({
      queryKey: watchQueryKeys.playback(this.identity, epoch, slug),
      staleTime: Infinity,
      gcTime: this.policy.playbackGcMs,
      refetchOnMount: false,
      queryFn: async ({ signal }) => {
        this.assertReady(epoch);
        const data = await this.api.playback(slug, signal);
        this.assertReady(epoch);
        return data;
      },
    });
  }

  collectionOptions(source: WatchCollectionSource, page = 1) {
    watchCollectionUrl(source, page);
    const epoch = this.state.epoch;
    // Copy primitives so a caller cannot mutate an in-flight query's endpoint.
    const selected: WatchCollectionSource = source.kind === "latest"
      ? { kind: "latest" } : { kind: source.kind, slug: source.slug };
    return queryOptions({
      queryKey: watchQueryKeys.collection(this.identity, epoch, selected, page),
      staleTime: Infinity,
      // Home has eight fixed collections; keep accepted pages for its scope.
      // The existing 32-inactive-entry cap and stop()/revoke still clear memory.
      gcTime: Infinity,
      refetchOnMount: false,
      queryFn: async ({ signal }) => {
        this.assertReady(epoch);
        const data = await this.api.collection(selected, page, signal);
        this.assertReady(epoch);
        return data;
      },
    });
  }

  /** Remote images/players are assigned by native browser elements, outside the
   * JSON transport. Obtain a fresh permit before assigning ANY media src. A1
   * coalesces simultaneous checks; no second auth/realtime subscription.
   */
  async permitMedia(consumerSignal: AbortSignal): Promise<WatchAccessPermit> {
    const epoch = this.state.epoch;
    this.assertReady(epoch);
    if (consumerSignal.aborted) throw new WatchApiError("cancelled");
    const controller = new AbortController();
    const cancel = () => controller.abort(new WatchApiError("cancelled"));
    const timer = setTimeout(() => controller.abort(new WatchApiError("timeout")), 13_000);
    consumerSignal.addEventListener("abort", cancel, { once: true });
    this.pendingMedia.add(controller);
    try {
      const permit = await waitForWatchOperation(this.verifyAccess(), controller.signal);
      this.assertReady(epoch);
      if (controller.signal.aborted || permit.signal.aborted) throw new WatchApiError("cancelled");
      return permit;
    } finally {
      clearTimeout(timer);
      consumerSignal.removeEventListener("abort", cancel);
      this.pendingMedia.delete(controller);
    }
  }

  /** For explicit interactions: warm cache is reused; force=true refreshes once.
   * Components normally subscribe through useWatchLatest instead.
   */
  async loadLatest(page = 1, force = false) {
    const epoch = this.state.epoch;
    this.assertReady(epoch);
    const options = this.latestOptions(page);
    const data = await this.queryClient.query({ ...options,
      staleTime: force ? 0 : this.policy.listStaleMs,
    });
    this.assertReady(epoch);
    return data;
  }

  cancelLatest(page = 1) {
    return this.queryClient.cancelQueries({ queryKey: this.latestOptions(page).queryKey, exact: true });
  }

  private assertReady(epoch: number) {
    if (typeof window === "undefined") throw new WatchApiError("browser_only");
    if (!this.state.ready || this.state.epoch !== epoch || this.permitSignal?.aborted) {
      throw new WatchApiError("inactive");
    }
  }

  private observePermit(permit: WatchAccessPermit) {
    if (!permit || permit.userId !== this.identity.userId || permit.accessKind !== this.identity.accessKind
      || permit.revision !== this.identity.revision || !permit.signal || permit.signal.aborted
      || (this.permitSignal !== null && this.permitSignal !== permit.signal)) {
      throw new WatchApiError("access_denied");
    }
    if (this.permitSignal === null) {
      this.permitSignal = permit.signal;
      permit.signal.addEventListener("abort", this.stop, { once: true });
      this.detachPermit = () => permit.signal.removeEventListener("abort", this.stop);
    }
  }

  private schedulePrune() {
    if (this.pruneScheduled) return;
    this.pruneScheduled = true;
    void Promise.resolve().then(() => {
      this.pruneScheduled = false;
      if (!this.state.ready) return;
      const cache = this.queryClient.getQueryCache();
      const inactive = cache.getAll().filter(query => query.getObserversCount() === 0 && query.state.fetchStatus === "idle")
        .sort((a, b) => Math.max(a.state.dataUpdatedAt, a.state.errorUpdatedAt)
          - Math.max(b.state.dataUpdatedAt, b.state.errorUpdatedAt));
      for (const query of inactive.slice(0, Math.max(0, inactive.length - this.policy.maxInactiveQueries))) cache.remove(query);
    });
  }
}
