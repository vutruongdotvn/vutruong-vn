"use client";

import { useQuery } from "@tanstack/react-query";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";

export function useWatchMovie(slug: string) {
  const scope = useWatchQueryScope();

  return useQuery({
    ...scope.detailOptions(slug),
    enabled: scope.getSnapshot().ready,
  });
}
