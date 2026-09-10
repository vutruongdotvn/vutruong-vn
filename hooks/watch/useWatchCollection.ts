"use client";

import { useQuery } from "@tanstack/react-query";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";
import type { WatchCollectionSource } from "@/types/watchApi";

export function useWatchCollection(source: WatchCollectionSource, enabled: boolean) {
  const scope = useWatchQueryScope();
  // Homepage intentionally exposes no page-changing or infinite-scroll API.
  return useQuery({ ...scope.collectionOptions(source, 1), enabled: enabled && scope.getSnapshot().ready });
}
