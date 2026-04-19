"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Session, User } from "@supabase/supabase-js";

export type UserStatus = "pending" | "approved" | "banned" | "rejected" | "revoked" | "unknown";

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [status, setStatus] = useState<UserStatus>("unknown");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const fetchProfileData = async (currentUser: User | null) => {
      if (!currentUser) {
        if (mounted) {
          setUser(null);
          setRole(null);
          setStatus("unknown");
          setLoading(false);
        }
        return;
      }

      if (mounted) setUser(currentUser);

      try {
        // 🌟 NÂNG CẤP BẢO MẬT: Dùng limit(1) và maybeSingle() để chặn đứng mọi lỗi Crash
        const { data, error } = await supabase
          .from("profiles")
          .select("role, status")
          .eq("email", currentUser.email)
          .limit(1)
          .maybeSingle(); 

        if (error) {
          console.error("❌ Lỗi truy vấn Supabase:", error.message);
        }

        if (mounted) {
          if (data) {
            setRole(data.role || "user");
            const exactStatus = data.status?.toLowerCase().trim();
            setStatus((exactStatus as UserStatus) || "pending");
          } else {
            // Nếu Database Trigger chưa chạy kịp, mặc định luôn là user pending (An toàn 100%)
            setRole("user");
            setStatus("pending");
          }
        }
      } catch (err) {
        console.error("❌ fetchProfileData Catch:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      await fetchProfileData(session?.user ?? null);
    };

    init();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoading(true);
      fetchProfileData(session?.user ?? null);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { user, role, status, loading };
}