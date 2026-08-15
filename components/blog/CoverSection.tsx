"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useProfile } from "@/hooks/useProfile";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import {
  getProfileAvatar,
  getProfileAvatarLightbox,
  getProfileCoverBackground,
  getProfileCoverImage,
  getProfileCoverLightbox,
} from "@/lib/cloudinary";
import ProfileMediaEditorModal from "@/components/blog/cover/ProfileMediaEditorModal";
import type { ProfileMediaKind } from "@/components/blog/cover/ProfileImageCropper";

export default function CoverSection() {
  const { profile, loading, refetch } = useProfile();
  const { role, status } = useUser();
  const [editorKind, setEditorKind] = useState<ProfileMediaKind | null>(null);
  const [postStats, setPostStats] = useState({ total: 0, today: 0 });

  const isAdmin = role === "admin" && status === "approved";

  useEffect(() => {
    const fetchStats = async () => {
      const now = new Date();
      const startOfDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
      );

      const [totalRes, todayRes] = await Promise.all([
        supabase.from("posts").select("*", { count: "exact", head: true }),
        supabase
          .from("posts")
          .select("*", { count: "exact", head: true })
          .gte("created_at", startOfDay.toISOString()),
      ]);

      if (!totalRes.error && !todayRes.error) {
        setPostStats({
          total: totalRes.count || 0,
          today: todayRes.count || 0,
        });
      } else {
        console.error("Post stats error:", totalRes.error || todayRes.error);
      }
    };

    void fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="w-full bg-white">
        <div className="relative mx-auto h-[240px] w-full max-w-6xl animate-pulse overflow-hidden bg-black/5 sm:h-[360px] md:h-[480px]">
          <div className="absolute inset-x-0 bottom-0 px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="flex items-center gap-4">
              <div className="size-20 rounded-full bg-gray-200 sm:size-26 md:size-30" />
              <div className="flex flex-col gap-2">
                <div className="h-4 w-28 rounded-md bg-gray-200 sm:h-5 sm:w-36 md:h-6 md:w-44" />
                <div className="h-3 w-40 rounded-md bg-gray-200 sm:h-4 sm:w-56 md:w-64" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  const coverValue = Array.isArray(profile.cover_image)
    ? profile.cover_image[0]
    : profile.cover_image;
  const coverMaster = coverValue || "/cover.jpg";
  const avatarMaster = profile.avatar || "/logo.png";
  const coverDisplay = getProfileCoverImage(coverMaster, 1920);
  const coverDisplayMobile = getProfileCoverImage(coverMaster, 768);
  const coverDisplayTablet = getProfileCoverImage(coverMaster, 1280);
  const coverBackground = getProfileCoverBackground(coverMaster);
  const avatarDisplay = getProfileAvatar(avatarMaster);
  const coverLightbox = getProfileCoverLightbox(coverMaster);
  const avatarLightbox = getProfileAvatarLightbox(avatarMaster);

  return (
    <div className="w-full">
      <div className="group relative h-[240px] w-full select-none overflow-hidden bg-neutral-100 sm:h-[360px] md:h-[480px]">
        {/* Nền blur dùng một biến thể Cloudinary 320px/q_auto:eco/dpr_1. */}
        <Image
          src={coverBackground}
          alt=""
          fill
          unoptimized
          priority
          aria-hidden="true"
          className="pointer-events-none z-0 scale-105 object-cover brightness-75"
        />

        {/* Fancybox chỉ tải biến thể tối đa 1920px, không tải master 4096px. */}
        <a
          href={coverLightbox}
          data-fancybox="profile-cover"
          aria-label="Mở ảnh bìa chất lượng cao"
          className="absolute inset-y-0 left-1/2 z-[1] block w-full max-w-6xl -translate-x-1/2 cursor-pointer overflow-hidden"
        >
          <picture className="relative block size-full">
            <source media="(max-width: 640px)" srcSet={coverDisplayMobile} />
            <source media="(max-width: 1024px)" srcSet={coverDisplayTablet} />
            <Image
              src={coverDisplay}
              alt="Ảnh bìa"
              fill
              unoptimized
              loading="eager"
              fetchPriority="high"
              sizes="(max-width: 640px) 768px, (max-width: 1024px) 1280px, 1920px"
              className="object-cover opacity-0 transition-opacity duration-1000 ease-out"
              onLoad={(event) =>
                event.currentTarget.classList.remove("opacity-0")
              }
            />
          </picture>
        </a>

        <div
          className="pointer-events-none absolute inset-0 z-[3] bg-gradient-to-t from-black/55 via-black/20 to-transparent transition-opacity duration-700 group-hover:opacity-80"
          style={{
            maskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,.85) 20%, rgba(0,0,0,.6) 40%, rgba(0,0,0,.3) 60%, rgba(0,0,0,.1) 80%, rgba(0,0,0,0) 100%)",
            WebkitMaskImage:
              "linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,.85) 20%, rgba(0,0,0,.6) 40%, rgba(0,0,0,.3) 60%, rgba(0,0,0,.1) 80%, rgba(0,0,0,0) 100%)",
          }}
        />

        {isAdmin && (
          <div className="pointer-events-none absolute inset-x-0 top-0 z-[6] mx-auto flex w-full max-w-6xl justify-end p-3 sm:p-4">
            <button
              type="button"
              onClick={() => setEditorKind("cover")}
              className="pointer-events-auto inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/30 bg-black/45 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur-md transition hover:bg-black/60 active:scale-95 sm:px-4 sm:text-sm"
            >
              <i className="fad fa-camera" aria-hidden="true" />
              <span className="hidden sm:inline">Chỉnh sửa</span>
            </button>
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 z-[4] mx-auto w-full max-w-6xl">
          <div className="px-3 pb-3 sm:px-4 sm:pb-4">
            <div className="flex flex-col items-center text-white sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
                <div className="pointer-events-auto relative size-20 shrink-0 sm:size-26 md:size-30">
                  <a
                    href={avatarLightbox}
                    data-fancybox="profile-avatar"
                    aria-label="Mở ảnh đại diện chất lượng cao"
                    className="relative block size-full cursor-pointer overflow-hidden rounded-full shadow-xl"
                  >
                    <Image
                      src={avatarDisplay}
                      alt="Ảnh đại diện"
                      fill
                      unoptimized
                      priority
                      sizes="120px"
                      className="object-cover"
                    />
                  </a>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => setEditorKind("avatar")}
                      aria-label="Thay đổi ảnh đại diện"
                      title="Thay đổi ảnh đại diện"
                      className="absolute -bottom-0.5 -right-0.5 flex size-8 cursor-pointer items-center justify-center rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-xs text-xs text-white/70 hover:text-white/90 shadow-lg transition duration-300 active:scale-98 sm:size-9"
                    >
                      <i className="fad fa-camera" aria-hidden="true" />
                    </button>
                  )}
                </div>

                <div className="flex flex-col items-center gap-0 sm:items-start sm:gap-0.5">
                  <div className="flex items-center gap-1 text-xl font-medium drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] md:text-2xl">
                    {profile.name || "User Name"}
                    <i
                      className="fas fa-badge-check cursor-pointer text-sm text-blue-500 active:scale-95 sm:text-base"
                      title="Tài khoản đã được xác thực"
                    />
                  </div>
                  <div className="text-[.8375rem] text-white/80 sm:text-sm/6">
                    <b>{postStats.total}</b> bài viết
                    <span className="mx-0.5 text-sm"> • </span>
                    <b>{postStats.today}</b> bài mới
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {editorKind && isAdmin && (
        <ProfileMediaEditorModal
          open
          kind={editorKind}
          profileId={profile.id}
          currentUrl={editorKind === "cover" ? coverMaster : avatarMaster}
          onClose={() => setEditorKind(null)}
          onSaved={async () => {
            await refetch();
          }}
        />
      )}
    </div>
  );
}