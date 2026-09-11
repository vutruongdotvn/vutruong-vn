"use client";

import { useQuery } from "@tanstack/react-query";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";
import type { WatchCollectionSource } from "@/types/watchApi";

/**
 * One mounted browser observes exactly one API page. placeholderData only keeps
 * the previous page metadata in RAM while the next page request is in flight;
 * WatchCollectionBrowser deliberately renders its 1:1 skeleton instead of the
 * old movie cards, so pagination can change without remounting the whole route.
 */
export function useWatchCollectionPage(
  source: WatchCollectionSource,
  page: number,
  enabled = true,
) {
  const scope = useWatchQueryScope();
  return useQuery({
    ...scope.collectionOptions(source, page),
    enabled: enabled && scope.getSnapshot().ready,
    placeholderData: previousData => previousData,
  });
}
