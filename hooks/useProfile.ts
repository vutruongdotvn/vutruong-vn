"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "admin")
        .single();

      if (error) {
        console.error("Profile error:", {
          message: error.message,
          code: error.code,
        });
      } else {
        setProfile(data);
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  return { profile, loading };
}