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
import BlogNavbar from "@/components/blog/BlogNavbar";


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
      <div
        className="w-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.015)] border-b border-black/10"
        aria-busy="true"
      >
        <span className="sr-only" role="status" aria-live="polite">
          Đang tải thông tin trang Blog...
        </span>

        <div
          className="relative h-[240px] w-full select-none overflow-hidden bg-neutral-100 sm:h-[360px] md:h-[480px]"
          aria-hidden="true"
        >
          <div className="absolute inset-y-0 left-1/2 w-full max-w-6xl -translate-x-1/2 animate-pulse bg-gray-200" />

          {isAdmin && (
            <div className="pointer-events-none absolute inset-x-0 top-0 z-[6] mx-auto flex w-full max-w-6xl justify-end p-3 sm:p-4">
              <div className="h-9 w-9 animate-pulse rounded-full border border-white/30 bg-black/10 sm:w-28" />
            </div>
          )}
        </div>

        <div className="w-full max-w-6xl mx-auto py-6 relative pb-18 mt-[-100px] relative z-3">
          <div className="noclass" aria-hidden="true">
            <div className="flex flex-col items-center text-white sm:flex-row sm:items-end sm:justify-between">
              <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
                <div className="relative size-40 shrink-0 rounded-full border-4 border-white bg-gray-200 sm:size-48">
                  {isAdmin && (
                    <div className="absolute bottom-3 right-3 size-9 rounded-full border border-black/10 bg-gray-300 shadow-lg sm:size-10" />
                  )}
                </div>

                <div className="mt-0 flex flex-col items-center gap-0 sm:mt-18 sm:items-start sm:gap-1">
                  <div className="flex h-7 items-center gap-1 md:h-8 lg:h-9">
                    <div className="h-6 w-40 animate-pulse rounded-md bg-gray-200 sm:w-44 md:h-7 md:w-48 lg:h-8" />
                    <div className="size-3 animate-pulse rounded-full bg-blue-200 sm:size-4" />
                  </div>

                  <div className="flex h-4 items-center gap-1 sm:h-6">
                    <div className="h-3.5 w-14 animate-pulse rounded bg-gray-200 sm:h-4" />
                    <div className="size-1 rounded-full bg-gray-300" />
                    <div className="h-3.5 w-12 animate-pulse rounded bg-gray-200 sm:h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <BlogNavbar />
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
    <div className="w-full bg-white shadow-[0_10px_30px_rgba(0,0,0,0.015)] border-b border-black/10">
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
      </div>

      <div className="w-full max-w-6xl mx-auto py-6 relative pb-18 mt-[-100px] relative z-3">
        <div className="noclass">
          <div className="flex flex-col items-center text-white sm:flex-row sm:items-end sm:justify-between">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-5">
              <div className="pointer-events-auto relative shrink-0 size-40 sm:size-48">
                <a
                  href={avatarLightbox}
                  data-fancybox="profile-avatar"
                  aria-label="Mở ảnh đại diện chất lượng cao"
                  className="relative block size-full cursor-pointer overflow-hidden rounded-full border-4 border-white"
                >
                  <Image
                    src={avatarDisplay}
                    alt="Ảnh đại diện"
                    fill
                    unoptimized
                    priority
                    sizes="120px"
                    className="object-cover hover:brightness-80 transition duration-300"
                  />
                </a>

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => setEditorKind("avatar")}
                    aria-label="Thay đổi ảnh đại diện"
                    title="Thay đổi ảnh đại diện"
                    className="absolute bottom-3 right-3 flex size-9 cursor-pointer items-center justify-center rounded-full
                      bg-black/40 hover:bg-black/60 backdrop-blur-xs border border-black/10
                      text-base text-white/70 hover:text-white/90 shadow-lg transition duration-300 active:scale-98 sm:size-10"
                  >
                    <i className="fad fa-camera" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="flex flex-col items-center gap-0 sm:items-start sm:gap-1 mt-0 sm:mt-18">
                <div className="flex items-center gap-1 text-xl font-bold md:text-2xl lg:text-3xl text-slate-800">
                  {profile.name || "User Name"}
                  <i
                    className="fas fa-badge-check cursor-pointer text-sm text-blue-500 active:scale-95 sm:text-base"
                    title="Tài khoản đã được xác thực"
                  />
                </div>
                <div className="text-[.8375rem] text-slate-800 sm:text-sm/6">
                  <b>{postStats.total}</b> bài viết
                  <span className="mx-0.5 text-sm"> • </span>
                  <b>{postStats.today}</b> bài mới
                </div>
              </div>
            </div>
          </div>
        </div>
        <BlogNavbar />
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