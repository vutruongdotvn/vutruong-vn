"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { createContext, Fragment, useContext, useEffect, useState, useSyncExternalStore, type ReactNode } from "react";
import { useWatchAccess } from "@/components/watch/access/WatchAccessProvider";
import { WatchQueryScope } from "@/lib/watch/watchQueryScope";

const WatchQueryContext = createContext<WatchQueryScope | null>(null);

/** Mount only INSIDE WatchGuard, whose identity/revision key owns this lifetime. */
export default function WatchQueryProvider({ children }: { children: ReactNode }) {
  const access = useWatchAccess();
  const [scope] = useState(() => new WatchQueryScope({
    userId: access.userId ?? "", accessKind: access.accessKind ?? "approved_user", revision: access.revision,
  }, access.requireAccess));
  const state = useSyncExternalStore(scope.subscribe, scope.getSnapshot, scope.getServerSnapshot);

  useEffect(() => { scope.start(); return scope.stop; }, [scope]);

  return (
    <QueryClientProvider client={scope.queryClient}>
      <WatchQueryContext.Provider value={scope}>
        {/* Wait for the provider effect before mounting any query consumer. */}
        {state.ready ? <Fragment key={state.epoch}>{children}</Fragment> : null}
      </WatchQueryContext.Provider>
    </QueryClientProvider>
  );
}

export function useWatchQueryScope() {
  const scope = useContext(WatchQueryContext);
  if (!scope) throw new Error("Watch query phải nằm trong WatchQueryProvider sau WatchGuard.");
  return scope;
}
