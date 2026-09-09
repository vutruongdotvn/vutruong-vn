import type { WatchAccessPermit } from "../../types/watchAccess";

export type WatchQueryIdentity = Pick<WatchAccessPermit, "userId" | "accessKind" | "revision">;

export const watchQueryKeys = {
  detail: (identity: WatchQueryIdentity, epoch: number, slug: string) =>
    ["watch", identity.userId, identity.accessKind, identity.revision, epoch, "detail", slug] as const,
  latest: (identity: WatchQueryIdentity, epoch: number, page: number) =>
    ["watch", identity.userId, identity.accessKind, identity.revision, epoch, "latest", page] as const,
};
