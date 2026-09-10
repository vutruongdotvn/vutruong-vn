import type { WatchAccessPermit } from "../../types/watchAccess";
import type { WatchCollectionSource } from "../../types/watchApi";

export type WatchQueryIdentity = Pick<WatchAccessPermit, "userId" | "accessKind" | "revision">;

export const watchQueryKeys = {
  collection: (identity: WatchQueryIdentity, epoch: number, source: WatchCollectionSource, page: number) =>
    source.kind === "latest"
      ? ["watch", identity.userId, identity.accessKind, identity.revision, epoch, "latest", page] as const
      : ["watch", identity.userId, identity.accessKind, identity.revision, epoch, "collection", source.kind, source.slug, page] as const,
  detail: (identity: WatchQueryIdentity, epoch: number, slug: string) =>
    ["watch", identity.userId, identity.accessKind, identity.revision, epoch, "detail", slug] as const,
  playback: (identity: WatchQueryIdentity, epoch: number, slug: string) =>
    ["watch", identity.userId, identity.accessKind, identity.revision, epoch, "playback", slug] as const,
  latest: (identity: WatchQueryIdentity, epoch: number, page: number) =>
    ["watch", identity.userId, identity.accessKind, identity.revision, epoch, "latest", page] as const,
};
