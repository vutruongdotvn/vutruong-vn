"use client";

import {
  createContext,
  createElement,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserRole = "admin" | "user" | null;

export type UserStatus =
  | "pending"
  | "approved"
  | "banned"
  | "rejected"
  | "revoked"
  | "unknown";

export type UserProfile = {
  name: string | null;
  avatar: string | null;
} | null;

type UserContextValue = {
  user: User | null;
  role: UserRole;
  status: UserStatus;
  profile: UserProfile;
  loading: boolean;
};

type ProfileQueryError = {
  message?: string;
  details?: string;
  hint?: string;
  code?: string;
};

const UserContext = createContext<UserContextValue | null>(null);

const NETWORK_ERROR_PATTERN =
  /failed to fetch|fetch failed|network\s*error|network request failed|load failed|err_network/i;

const VALID_STATUSES = new Set<UserStatus>([
  "pending",
  "approved",
  "banned",
  "rejected",
  "revoked",
  "unknown",
]);

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, milliseconds));
}

function isNetworkError(error: ProfileQueryError) {
  return NETWORK_ERROR_PATTERN.test(
    [error.message, error.details, error.hint].filter(Boolean).join(" ")
  );
}

function serializeProfileError(error: ProfileQueryError) {
  return {
    message: error.message || "Lỗi Supabase không xác định.",
    details: error.details || null,
    hint: error.hint || null,
    code: error.code || null,
  };
}

function normalizeStatus(value: unknown): UserStatus {
  if (typeof value !== "string") return "pending";

  const normalized = value.toLowerCase().trim() as UserStatus;
  return VALID_STATUSES.has(normalized) ? normalized : "pending";
}

function useSharedUserState(): UserContextValue {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [status, setStatus] = useState<UserStatus>("unknown");
  const [profile, setProfile] = useState<UserProfile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let requestId = 0;
    let requestedUserId: string | null | undefined;
    let authEventVersion = 0;

    const setAnonymous = () => {
      if (!active) return;

      setUser(null);
      setRole(null);
      setStatus("unknown");
      setProfile(null);
      setLoading(false);
    };

    const queryProfile = async (userId: string) => {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const result = await supabase
          .from("profiles")
          .select("name, avatar, role, status")
          .eq("id", userId)
          .maybeSingle();

        if (!result.error) return result;

        if (!isNetworkError(result.error) || attempt === 1) {
          return result;
        }

        await wait(800);
        if (!active) return result;
      }

      throw new Error("Không thể hoàn tất truy vấn profile.");
    };

    const syncUser = async (currentUser: User | null) => {
      if (!currentUser) {
        requestedUserId = null;
        requestId += 1;
        setAnonymous();
        return;
      }

      setUser(currentUser);

      // getSession(), INITIAL_SESSION, SIGNED_IN và TOKEN_REFRESHED có thể
      // cùng trả về một user. Chỉ tải profile khi danh tính thực sự thay đổi.
      if (requestedUserId === currentUser.id) return;

      if (
        requestedUserId !== undefined &&
        requestedUserId !== currentUser.id
      ) {
        setRole(null);
        setStatus("unknown");
        setProfile(null);
      }

      requestedUserId = currentUser.id;
      const currentRequestId = ++requestId;
      setLoading(true);

      try {
        const { data, error } = await queryProfile(currentUser.id);
        if (!active || currentRequestId !== requestId) return;

        if (error) {
          const errorInfo = serializeProfileError(error);

          if (isNetworkError(error)) {
            // Lỗi mạng tạm thời không nên kích hoạt Next.js error overlay.
            console.warn(
              "Không thể kết nối Supabase để tải profile:",
              errorInfo
            );
          } else {
            console.error("Lỗi truy vấn profile Supabase:", errorInfo);
          }

          // Mặc định an toàn: không cấp quyền admin khi chưa xác minh được.
          setRole("user");
          setStatus("pending");
          setProfile(null);
          return;
        }

        if (!data) {
          setRole("user");
          setStatus("pending");
          setProfile(null);
          return;
        }

        setRole(data.role?.toLowerCase() === "admin" ? "admin" : "user");
        setStatus(normalizeStatus(data.status));
        setProfile({
          name: data.name || null,
          avatar: data.avatar || null,
        });
      } catch (error) {
        if (!active || currentRequestId !== requestId) return;

        console.warn(
          "Không thể tải profile Supabase:",
          error instanceof Error ? error.message : error
        );
        setRole("user");
        setStatus("pending");
        setProfile(null);
      } finally {
        if (active && currentRequestId === requestId) {
          setLoading(false);
        }
      }
    };

    const handleAuthChange = (
      event: AuthChangeEvent,
      session: Session | null
    ) => {
      if (!active) return;

      if (event === "SIGNED_OUT") {
        authEventVersion += 1;
        void syncUser(null);
        return;
      }

      if (event === "INITIAL_SESSION") {
        authEventVersion += 1;
        void syncUser(session?.user ?? null);
        return;
      }

      // Một event khác không có session không đồng nghĩa người dùng đã đăng xuất.
      if (!session?.user) return;

      authEventVersion += 1;
      void syncUser(session.user);
    };

    const getSessionAuthVersion = authEventVersion;

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active || authEventVersion !== getSessionAuthVersion) return;

        if (error) {
          console.warn("Không thể khôi phục Supabase session:", error.message);
          setLoading(false);
          return;
        }

        void syncUser(data.session?.user ?? null);
      })
      .catch((error) => {
        if (!active || authEventVersion !== getSessionAuthVersion) return;

        console.warn(
          "Không thể khôi phục Supabase session:",
          error instanceof Error ? error.message : error
        );
        setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthChange);

    return () => {
      active = false;
      requestId += 1;
      subscription.unsubscribe();
    };
  }, []);

  return useMemo(
    () => ({ user, role, status, profile, loading }),
    [user, role, status, profile, loading]
  );
}

export function UserProvider({ children }: { children: ReactNode }) {
  const value = useSharedUserState();

  return createElement(UserContext.Provider, { value }, children);
}

export function useUser() {
  const context = useContext(UserContext);

  if (!context) {
    throw new Error("useUser phải được sử dụng bên trong AuthProvider.");
  }

  return context;
}