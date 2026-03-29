"use client";

import { useEffect, useRef, useState } from "react";
import BlogUserCard from "@/components/blog/BlogUserCard";
import CreatePostModal from "@/components/blog/CreatePostModal";
import LoginModal from "@/components/auth/LoginModal";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { optimizeCloudinaryImage } from "@/lib/cloudinary";

export default function BlogUserPanel() {
  const [open, setOpen] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // ✅ Chỉ cho skeleton hiện 1 lần duy nhất lúc mới vào trang
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);

  const { user, role, loading: userLoading } = useUser();

  // ✅ Tránh fetch lặp vô ích khi cùng 1 user
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

  // ✅ Chỉ đánh dấu "đã load xong lần đầu" 1 lần duy nhất
  useEffect(() => {
    if (!userLoading && !profileLoading && !hasLoadedOnce) {
      setHasLoadedOnce(true);
    }
  }, [userLoading, profileLoading, hasLoadedOnce]);

  const fullName = user ? profile?.name || "Người dùng" : "Xin chào! 👋";
  const email = user?.email || "";

  const avatar = user
    ? optimizeCloudinaryImage(profile?.avatar, {
        width: 80,
        height: 80,
        quality: 80,
        crop: "fill",
      }) || "/images/default.jpg"
    : "/images/default.jpg";

  // ✅ Skeleton chỉ hiện trong lần load đầu tiên
  const showInitialSkeleton = !hasLoadedOnce && (userLoading || profileLoading);

  return (
    <>
      {showInitialSkeleton ? (
        <div className="space-y-4 md:space-y-4 mb-8">
          <div className="userWrap flex items-center justify-between gap-3 bg-white/80 backdrop-blur-md border border-white/70 p-4 rounded-2xl animate-pulse shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <div className="w-32 h-3 bg-gray-200 rounded mb-2" />
                <div className="w-24 h-3 bg-gray-200 rounded" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      ) : (
        <>
          <BlogUserCard
            user={user}
            role={role}
            fullName={fullName}
            email={email}
            avatar={avatar}
            className="mb-8"
            onOpenCreatePost={() => setOpen(true)}
            onOpenLogin={() => setShowLogin(true)}
          />

          {user && role !== "admin" && (
            <p className="text-center text-gray-500 text-sm mb-6">
              Bạn chỉ có quyền xem bài viết 👀
            </p>
          )}
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
    onClose={() => {
      setOpen(false);
    }}
  />
)}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </>
  );
}