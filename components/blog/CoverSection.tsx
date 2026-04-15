"use client";

import Link from "next/link";
import Image from "next/image";
import { useProfile } from "@/hooks/useProfile";
import { getProfileAvatar } from "@/lib/cloudinary";

export default function CoverSection() {
    const { profile, loading } = useProfile();

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
            <div className="size-18 sm:size-24 md:size-28 rounded-full bg-gray-100 backdrop-blur-md" />

            {/* TEXT */}
            <div className="flex flex-col gap-2">

              {/* NAME */}
              <div className="h-4 sm:h-5 md:h-6 w-28 sm:w-36 md:w-44 rounded-md bg-gray-100" />

              {/* TAGLINE */}
              <div className="h-3 sm:h-4 w-40 sm:w-56 md:w-64 rounded-md bg-gray-100" />

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
        getProfileAvatar(profile.avatar) || "/og/avatar.png";

    return (
        <div className="w-full">

            {/* COVER WRAPPER */}
            <div className="relative w-full h-[240px] sm:h-[360px] md:h-[480px] overflow-hidden rounded-0 sm:rounded-2xl">

                {/* COVER IMAGE */}
                <Image
                    src={cover}
                    alt="cover"
                    fill
                    unoptimized
                    className="object-cover"
                    priority
                />

                {/* OVERLAY GRADIENT */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

                {/* INFO CARD (ABSOLUTE) */}
                <div className="absolute bottom-0 left-0 right-0">

                    <div className="px-3 sm:px-4 pb-3 sm:pb-4">

                        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between text-white">

                            {/* LEFT */}
                            <div className="flex items-center gap-4">

                                {/* AVATAR */}
                                <div
                                    className="relative size-18 sm:size-24 md:size-28 rounded-full shadow-xl overflow-hidden pointer-events-none">
                                    <Image src={avatar} alt="avatar" fill unoptimized className="object-cover"/>
                                </div>

                                {/* NAME */}
                                <div className="flex items-start gap-0 sm:gap-0.5 flex-col">
                                    <h1 className="text-base sm:text-xl md:text-2xl font-semibold flex items-center gap-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
                                        {profile.name || "Vũ Trường"}
                                    </h1>
                                    <p className="text-[.8375rem] sm:text-base/6 text-white/80">
                                        Lưu giữ những điều đẹp đẽ và giá trị ❤️‍🩹
                                    </p>
                                </div>
                            </div>

                            {/* ACTIONS */}
                            <div className="hidden sm:flex gap-2 mt-4 sm:mt-0">
                                <Link href="/contact" className=" px-4 py-2 rounded-lg
                  bg-white text-black text-sm font-medium
                  flex items-center gap-2
                  hover:bg-white/90 transition active:scale-95
                ">
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