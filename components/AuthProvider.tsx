"use client";

import { useEffect } from "react";
import { createProfileIfNotExists } from "@/lib/auth";
import { supabase } from "@/lib/supabase";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    let mounted = true;

    const init = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        if (session?.user) {
          await createProfileIfNotExists();
        }
      } catch (err) {
        console.error("AuthProvider init error:", err);
      }
    };

    init();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        try {
          await createProfileIfNotExists();
        } catch (err) {
          console.error("AuthProvider SIGNED_IN error:", err);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return <>{children}</>;
}