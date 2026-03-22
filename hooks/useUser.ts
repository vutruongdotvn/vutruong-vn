"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();

      const currentUser = data.user;
      setUser(currentUser);

      // 👉 CHECK ADMIN (hard-code trước)
      if (currentUser?.email === "admin@vutruong.vn") {
        setRole("admin");
      } else if (currentUser) {
        setRole("user");
      } else {
        setRole(null);
      }
    };

    getUser();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const currentUser = session?.user || null;
        setUser(currentUser);

        if (currentUser?.email === "admin@vutruong.vn") {
          setRole("admin");
        } else if (currentUser) {
          setRole("user");
        } else {
          setRole(null);
        }
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { user, role };
}