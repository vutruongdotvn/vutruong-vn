"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export type UserStatus =
  | "pending"
  | "approved"
  | "banned"
  | "rejected"
  | "revoked"
  | "unknown";

const NETWORK_ERROR_PATTERN = /failed to fetch|networkerror|load failed/i;

function wait(milliseconds: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds));
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [status, setStatus] = useState<UserStatus>("unknown");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    let requestId = 0;
    let requestedUserId: string | null | undefined;

    const setAnonymous = () => {
      if (!active) return;
      setUser(null);
      setRole(null);
      setStatus("unknown");
      setLoading(false);
    };

    const queryProfile = async (userId: string) => {
      for (let attempt = 0; attempt < 2; attempt += 1) {
        const result = await supabase
          .from("profiles")
          .select("role, status")
          .eq("id", userId)
          .maybeSingle();

        if (!result.error) return result;

        const isNetworkError = NETWORK_ERROR_PATTERN.test(
          result.error.message || ""
        );
        if (!isNetworkError || attempt === 1) return result;
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

      // getSession(), INITIAL_SESSION và SIGNED_IN có thể cùng trả về một user.
      // SIGNED_IN cũng có thể lặp lại khi tab trình duyệt được focus.
      // Chỉ tải profile khi danh tính thực sự thay đổi.
      if (requestedUserId === currentUser.id) return;

      if (
        requestedUserId !== undefined &&
        requestedUserId !== currentUser.id
      ) {
        setRole(null);
        setStatus("unknown");
      }

      requestedUserId = currentUser.id;
      const currentRequestId = ++requestId;
      setLoading(true);

      try {
        const { data, error } = await queryProfile(currentUser.id);
        if (!active || currentRequestId !== requestId) return;

        if (error) {
          const message = error.message || "Lỗi Supabase không xác định.";
          if (NETWORK_ERROR_PATTERN.test(message)) {
            // Lỗi mạng tạm thời không nên kích hoạt Next.js error overlay.
            console.warn("Không thể kết nối Supabase để tải profile:", message);
          } else {
            console.error("Lỗi truy vấn profile Supabase:", message);
          }

          // Mặc định an toàn: không cấp quyền admin khi không xác minh được.
          setRole("user");
          setStatus("pending");
          return;
        }

        if (data) {
          setRole(data.role?.toLowerCase() === "admin" ? "admin" : "user");
          const exactStatus = data.status?.toLowerCase().trim();
          setStatus((exactStatus as UserStatus) || "pending");
        } else {
          setRole("user");
          setStatus("pending");
        }
      } catch (error) {
        if (!active || currentRequestId !== requestId) return;
        console.warn(
          "Không thể tải profile Supabase:",
          error instanceof Error ? error.message : error
        );
        setRole("user");
        setStatus("pending");
      } finally {
        if (active && currentRequestId === requestId) setLoading(false);
      }
    };

    const handleAuthChange = (
      event: AuthChangeEvent,
      session: Session | null
    ) => {
      if (!active) return;

      // Chỉ SIGNED_OUT mới được phép xóa user đã xác thực.
      if (event === "SIGNED_OUT") {
        void syncUser(null);
        return;
      }

      // Một event không có session không đồng nghĩa người dùng đã đăng xuất.
      // Bỏ qua để tránh UI nhảy về trạng thái guest trong lúc đồng bộ token.
      if (!session?.user) return;

      if (event === "TOKEN_REFRESHED") {
        setUser(session.user);
        return;
      }

      void syncUser(session.user);
    };

    void supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!active) return;

        if (error) {
          console.warn("Không thể khôi phục Supabase session:", error.message);
          setLoading(false);
          return;
        }

        void syncUser(data.session?.user ?? null);
      })
      .catch((error) => {
        if (!active) return;
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

  return { user, role, status, loading };
}