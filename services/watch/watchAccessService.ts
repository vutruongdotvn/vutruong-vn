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

  async function request(path: string, token: string, signal: AbortSignal) {
    if (signal.aborted) throw signal.reason;
    if (!url || !publicKey) throw new WatchAccessError("unavailable");
    const response = await fetcher(`${url.replace(/\/$/, "")}${path}`, {
      method: "POST", signal, cache: "no-store", credentials: "omit", redirect: "error",
      headers: { apikey: publicKey, Authorization: `Bearer ${token}`,
        Accept: "application/json", "Content-Type": "application/json" },
      body: "{}",
    });
    const body: unknown = await response.json();
    if (!response.ok) {
      const code = body && typeof body === "object" ? (body as Record<string, unknown>).code : null;
      throw new WatchAccessError(code === "PGRST202" ? "rpc_missing"
        : response.status === 401 || response.status === 403 ? "session_invalid" : "unavailable");
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
      // PostgREST validates this Bearer token before executing the no-argument
      // RPC. The function derives user_id from auth.uid(); parseWatchAccess then
      // requires that ID to match the locally observed session. A separate
      // /auth/v1/user request would repeat authentication without strengthening
      // the authorization decision returned by the database.
      const result = await request("/rest/v1/rpc/get_watch_access", session.accessToken, signal);
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
