"use client";

import { useQuery } from "@tanstack/react-query";
import { useWatchAccess } from "@/components/watch/access/WatchAccessProvider";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";
import {
  fetchWatchDirectory,
  type WatchDirectoryKind,
} from "@/lib/watch/watchDirectory";
import { WatchApiError } from "@/types/watchApi";

export function useWatchDirectory(kind: WatchDirectoryKind, enabled = true) {
  const access = useWatchAccess();
  const scope = useWatchQueryScope();
  const epoch = scope.getSnapshot().epoch;
  const identity = {
    userId: access.userId ?? "",
    accessKind: access.accessKind ?? "approved_user",
    revision: access.revision,
  } as const;

  return useQuery({
    queryKey: [
      "watch",
      identity.userId,
      identity.accessKind,
      identity.revision,
      epoch,
      "directory",
      kind,
    ] as const,
    enabled: enabled && scope.getSnapshot().ready && Boolean(access.userId && access.accessKind),
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    retryOnMount: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
    networkMode: "always",
    queryFn: ({ signal }) => {
      if (!access.userId || !access.accessKind) {
        throw new WatchApiError("access_denied");
      }
      return fetchWatchDirectory(kind, identity, access.requireAccess, signal);
    },
  });
}
