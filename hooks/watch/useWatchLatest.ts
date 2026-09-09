"use client";

import { useQuery } from "@tanstack/react-query";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";

/** Shared list query; rows below the viewport can opt out with enabled=false. */
export function useWatchLatest(page = 1, enabled = true) {
  const scope = useWatchQueryScope();
  return useQuery({ ...scope.latestOptions(page), enabled: enabled && scope.getSnapshot().ready });
}
