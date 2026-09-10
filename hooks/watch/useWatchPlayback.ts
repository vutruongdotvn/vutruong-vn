"use client";

import { useQuery } from "@tanstack/react-query";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";

/** This hook must only be mounted by an episode route, never the detail page. */
export function useWatchPlayback(slug: string) {
  const scope = useWatchQueryScope();

  return useQuery({
    ...scope.playbackOptions(slug),
    enabled: scope.getSnapshot().ready,
  });
}
