"use client";

import Link from "next/link";
import Image from "next/image";
import { useProfile } from "@/hooks/useProfile";
import { getProfileAvatar } from "@/lib/cloudinary";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function CoverSection() {
    const { profile, loading } = useProfile();
    const [postStats, setPostStats] = useState({
        total: 0,
        today: 0,
    });

    useEffect(() => {
        const fetchStats = async () => {
            // 👉 chuẩn timezone local (VN)
            const now = new Date();
            const startOfDay = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate()
            );

            const isoToday = startOfDay.toISOString();

            // 👉 chạy song song (nhanh hơn)
            const [totalRes, todayRes] = await Promise.all([
                supabase
                    .from("posts")
                    .select("*", { count: "exact", head: true }),
                supabase
                    .from("posts")
                    .select("*", { count: "exact", head: true })
                    .gte("created_at", isoToday),
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

        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="w-full">
                {/* COVER */}
                <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] overflow-hidden rounded-0 sm:rounded-2xl bg-white animate-pulse">

                    {/* OVERLAY */}
                    <div className="absolute inset-0 bg-none" />

                    {/* INFO SKELETON */}
                    <div className="absolute bottom-0 left-0 right-0">
                        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                            <div className="flex items-center gap-4">
                                {/* AVATAR */}
                                <div className="size-20 sm:size-26 md:size-30 rounded-full bg-gray-200 backdrop-blur-md animate-pulse" />

                                {/* TEXT */}
                                <div className="flex flex-col gap-2">
                                    {/* NAME */}
                                    <div className="h-4 sm:h-5 md:h-6 w-28 sm:w-36 md:w-44 rounded-md bg-gray-200 animate-pulse" />
                                    {/* TAGLINE */}
                                    <div className="h-3 sm:h-4 w-40 sm:w-56 md:w-64 rounded-md bg-gray-200 animate-pulse" />
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!profile) return null;

    const cover =
        Array.isArray(profile.cover_image)
            ? profile.cover_image[0]
            : profile.cover_image || "/cover.jpg";

    const avatar =
        getProfileAvatar(profile.avatar) || "/logo.png";

    return (
        <div className="w-full">

            {/* COVER WRAPPER */}
            <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] overflow-hidden rounded-0 sm:rounded-2xl group select-none">

                {/* COVER IMAGE */}
                <Image
                    src={cover}
                    alt="cover"
                    fill
                    unoptimized
                    className="object-cover opacity-0 transition-opacity duration-1200 ease-out pointer-events-none"
                    onLoad={(e) => e.currentTarget.classList.remove("opacity-0")}
                    priority loading="eager"
                />

                {/* OVERLAY BLUR GRADIENT */}
                <div
                    className="
    absolute left-0 bottom-0 h-full w-full 
    backdrop-blur-sm 
    bg-gradient-to-t from-black/50 via-black/15 to-transparent 
    pointer-events-none 
    transition-opacity duration-900 ease-out
    group-hover:opacity-25
  "
                    style={{
                        maskImage: `linear-gradient(
      to top,
      rgba(0,0,0,1) 0%,
      rgba(0,0,0,0.85) 20%,
      rgba(0,0,0,0.6) 40%,
      rgba(0,0,0,0.3) 60%,
      rgba(0,0,0,0.1) 80%,
      rgba(0,0,0,0) 100%
    )`,
                        WebkitMaskImage: `linear-gradient(
      to top,
      rgba(0,0,0,1) 0%,
      rgba(0,0,0,0.85) 20%,
      rgba(0,0,0,0.6) 40%,
      rgba(0,0,0,0.3) 60%,
      rgba(0,0,0,0.1) 80%,
      rgba(0,0,0,0) 100%
    )`,
                    }}
                />

                {/* INFO CARD (ABSOLUTE) */}
                <div className="absolute bottom-0 left-0 right-0">
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between text-white">
                            {/* LEFT */}
                            <div className="flex items-center gap-4">

                                {/* AVATAR */}
                                <div className="relative size-20 sm:size-26 md:size-30 rounded-full shadow-xl overflow-hidden pointer-events-none">
                                    <Image src={avatar} alt="avatar" fill unoptimized loading="eager" className="object-cover" />
                                </div>

                                {/* NAME */}
                                <div className="flex items-start gap-0 sm:gap-0.5 flex-col">
                                    <div className="text-base sm:text-xl md:text-2xl font-semibold flex items-center gap-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                                        {profile.name || "User Name"}
                                        <i className="fad fa-badge-check text-sm sm:text-base text-blue-600 cursor-pointer active:scale-95" title="Tài khoản đã được xác thực." />
                                    </div>
                                    <div className="text-[.8375rem] sm:text-sm/6 text-white/80">
                                        <b>{postStats.total}</b> bài viết <span className="mx-0.5 text-sm">•</span> <b>{postStats.today}</b> bài mới
                                    </div>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="hidden sm:flex gap-2 mt-4 sm:mt-0">
                                <Link href="/contact" className=" px-4 py-2 rounded-lg bg-white text-black text-sm font-medium flex items-center gap-2 hover:bg-white/90 transition active:scale-95">
                                    <i className="fad fa-comment-lines" />
                                    Liên hệ
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}