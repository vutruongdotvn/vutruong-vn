"use client";

import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type AdminProfile = {
  id: string;
  name: string | null;
  email: string | null;
  avatar: string | null;
  cover_image: string | string[] | null;
  bio: string | null;
  role: string | null;
  status: string | null;
  created_at?: string | null;
};

function createProfileRealtimeChannelName(profileId: string) {
  const nonce =
    typeof globalThis.crypto?.randomUUID === "function"
      ? globalThis.crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `cover-section-profile-${profileId}-${nonce}`;
}

export function useProfile() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (showLoading = false) => {
    if (showLoading) setLoading(true);

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "admin")
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("Profile error:", {
        message: error.message,
        code: error.code,
      });
    } else {
      setProfile((data as AdminProfile | null) ?? null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchProfile(true);
  }, [fetchProfile]);

  useEffect(() => {
    if (!profile?.id) return;

    let active = true;
    const channel = supabase
      // Supabase Realtime tái sử dụng channel nếu topic trùng nhau. Một nonce
      // riêng cho mỗi lần effect chạy ngăn Strict Mode/HMR lấy lại channel cũ
      // đã subscribe nhưng chưa được removeChannel() hoàn tất.
      .channel(createProfileRealtimeChannelName(profile.id))
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${profile.id}`,
        },
        (payload) => {
          if (!active) return;
          setProfile(payload.new as AdminProfile);
        },
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const refetch = useCallback(() => fetchProfile(false), [fetchProfile]);

  return { profile, loading, refetch };
}