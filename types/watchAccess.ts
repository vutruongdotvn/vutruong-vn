export type WatchUserStatus =
  | "approved" | "pending" | "banned" | "rejected" | "revoked" | "unknown";

export type WatchAccessKind = "admin" | "approved_user";

export type WatchAccessDecision = {
  userId: string;
  allowed: boolean;
  accessKind: WatchAccessKind | null;
  status: WatchUserStatus;
};

export type WatchAccessState = {
  phase: "checking" | "anonymous" | "allowed" | "denied" | "error";
  userId: string | null;
  accessKind: WatchAccessKind | null;
  status: WatchUserStatus;
  isChecking: boolean;
  checkedAt: number | null;
  revision: number;
  error: string | null;
};

export type WatchSession = { userId: string; accessToken: string };

export type WatchAccessPermit = {
  userId: string;
  accessKind: WatchAccessKind;
  revision: number;
  signal: AbortSignal;
};

export type WatchAccessTransport = {
  readSession: (signal: AbortSignal) => Promise<WatchSession | null>;
  verify: (session: WatchSession, signal: AbortSignal) => Promise<WatchAccessDecision>;
  subscribe: (callback: (session: WatchSession | null) => void) => () => void;
};
