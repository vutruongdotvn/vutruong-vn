import type { Session, SupabaseClient } from "@supabase/supabase-js";
import type { WatchAccessTransport, WatchSession } from "../../types/watchAccess";
import { parseWatchAccess, waitForWatchOperation, WatchAccessError } from "../../lib/watch/watchAccessController";

function toWatchSession(session: Session | null): WatchSession | null {
  if (!session?.user?.id || !session.access_token) return null;
  return { userId: session.user.id, accessToken: session.access_token };
}

export function createWatchAccessTransport(client: SupabaseClient, config: {
  url?: string;
  publicKey?: string;
  fetcher?: typeof fetch;
} = {}): WatchAccessTransport {
  const fetcher = config.fetcher ?? fetch;
  // Same public configuration as lib/supabase.ts; no second Auth client/storage.
  const url = config.url ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publicKey = config.publicKey ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  async function request(path: string, token: string, signal: AbortSignal, method: "GET" | "POST") {
    if (signal.aborted) throw signal.reason;
    if (!url || !publicKey) throw new WatchAccessError("unavailable");
    const response = await fetcher(`${url.replace(/\/$/, "")}${path}`, {
      method, signal, cache: "no-store", credentials: "omit", redirect: "error",
      headers: { apikey: publicKey, Authorization: `Bearer ${token}`,
        Accept: "application/json", ...(method === "POST" ? { "Content-Type": "application/json" } : {}) },
      ...(method === "POST" ? { body: "{}" } : {}),
    });
    const body: unknown = await response.json();
    if (!response.ok) {
      const code = body && typeof body === "object" ? (body as Record<string, unknown>).code : null;
      throw new WatchAccessError(code === "PGRST202" ? "rpc_missing"
        : method === "GET" && (response.status === 401 || response.status === 403) ? "session_invalid" : "unavailable");
    }
    return body;
  }

  return {
    async readSession(signal) {
      if (signal.aborted) throw signal.reason;
      const result = await waitForWatchOperation(client.auth.getSession(), signal);
      if (result.error) throw new WatchAccessError("unavailable");
      return toWatchSession(result.data.session);
    },
    async verify(session, signal) {
      if (signal.aborted) throw signal.reason;
      // Same Auth endpoint used by getUser(token), with true cancellation and
      // no SDK session mutation if an old verification finishes after sign-in.
      const verified = await request("/auth/v1/user", session.accessToken, signal, "GET");
      if (!verified || typeof verified !== "object" || Array.isArray(verified)
        || (verified as Record<string, unknown>).id !== session.userId) {
        throw new WatchAccessError("session_invalid");
      }
      if (signal.aborted) throw signal.reason;
      // Use the SAME token for RPC; fetch has no implicit retry/refresh behavior.
      const result = await request("/rest/v1/rpc/get_watch_access", session.accessToken, signal, "POST");
      return parseWatchAccess(result, session.userId);
    },
    subscribe(callback) {
      const { data: { subscription } } = client.auth.onAuthStateChange((event, session) => {
        if (event === "SIGNED_OUT") { callback(null); return; }
        if (event === "INITIAL_SESSION" || session?.user) callback(toWatchSession(session));
      });
      return () => subscription.unsubscribe();
    },
  };
}
