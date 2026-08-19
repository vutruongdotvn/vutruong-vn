"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { getAvatarImage } from "@/lib/cloudinary";

export function useNavbarAuth() {
  const { user, role, loading: userLoading } = useUser();

  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const lastFetchedUserId = useRef<string | null>(null);

  const fetchProfile = async () => {
    if (!user) {
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Navbar fetchProfile error:", error);
        setProfile(null);
        return;
      }

      setProfile(data || null);
    } catch (err) {
      console.error("Navbar fetchProfile crash:", err);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (userLoading) return;

    if (!user) {
      lastFetchedUserId.current = null;
      setProfile(null);
      setProfileLoading(false);
      return;
    }

    if (lastFetchedUserId.current === user.id) {
      setProfileLoading(false);
      return;
    }

    lastFetchedUserId.current = user.id;
    setProfileLoading(true);
    fetchProfile();
  }, [user, userLoading]);

  const fullName = user ? profile?.name || "User" : "Xin chĂ o! đŸ‘‹";
  const email = user?.email || "";
  const avatar = user
    ? getAvatarImage(profile?.avatar) || "/images/default.jpg"
    : "/images/default.jpg";

  const authReady = !userLoading && !profileLoading;

  const handleLogout = async (onDone?: () => void) => {
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      console.error("Sign out error:", error);
      return;
    }

    setProfile(null);
    onDone?.();
  };

  return {
    user,
    role,
    userLoading,
    profile,
    profileLoading,
    fullName,
    email,
    avatar,
    authReady,
    showCreatePost,
    setShowCreatePost,
    showLogin,
    setShowLogin,
    handleLogout,
  };
}