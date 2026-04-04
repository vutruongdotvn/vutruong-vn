"use client";

import { useEffect, useRef, useState } from "react";
import BlogUserCard from "@/components/blog/BlogUserCard";
import BlogUserCardSkeleton from "@/components/blog/BlogUserCardSkeleton";
import CreatePostModal from "@/components/blog/CreatePostModal";
import LoginModal from "@/components/auth/LoginModal";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { getAvatarImage } from "@/lib/cloudinary";


export default function BlogUserPanel() {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // chỉ hiện skeleton 1 lần đầu duy nhất
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const { user, role, loading: userLoading } = useUser();
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
        console.error("BlogUserPanel fetchProfile error:", error);
        setProfile(null);
        return;
      }

      setProfile(data || null);
    } catch (err) {
      console.error("BlogUserPanel fetchProfile crash:", err);
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

  useEffect(() => {
    if (!userLoading && !profileLoading && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [userLoading, profileLoading, hasLoadedOnce]);

  const fullName = user ? profile?.name || "User" : "Xin chào! 👋";
  const email = user?.email || "";

  const avatar = user
    ? getAvatarImage(profile?.avatar) || "/images/default.jpg"
    : "/images/default.jpg";

  const showInitialSkeleton = !hasLoadedOnce && (userLoading || profileLoading);

  return (
    <>
      {showInitialSkeleton ? (
        <BlogUserCardSkeleton className="mb-5 md:mb-4" />
      ) : (
        <>
          <BlogUserCard
            user={user}
            role={role}
            fullName={fullName}
            email={email}
            avatar={avatar}
            className="mb-5 md:mb-4"
            onOpenCreatePost={() => setOpen(true)}
            onOpenLogin={() => setShowLogin(true)}
          />

          {/*{user && role !== "admin" && (
            <p className="text-center text-gray-500 text-sm mb-6">
              Bạn chỉ có quyền xem bài viết 👀
            </p>
          )}*/}
        </>
      )}

      {user && role === "admin" && (
        <CreatePostModal
          isOpen={open}
          editingPost={null}
          onSuccess={(newPost) => {
            window.dispatchEvent(
              new CustomEvent("blog-post-created", {
                detail: newPost,
              })
            );
          }}
          onClose={() => setOpen(false)}
        />
      )}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}