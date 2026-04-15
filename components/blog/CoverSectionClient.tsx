"use client";

import Image from "next/image";
import type { Profile } from "@/types/profile";

export default function CoverSectionClient({
  profile,
}: {
  profile: Profile;
}) {
  const cover = profile.cover_image?.[0] || "/fallback-cover.jpg";
  const avatar = profile.avatar || "/fallback-avatar.png";

  return (
    <div className="relative w-full">

      {/* COVER */}
      <div className="relative w-full h-[180px] sm:h-[240px] md:h-[300px] overflow-hidden rounded-xl">
        <Image
          src={cover}
          alt="cover"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* AVATAR */}
      <div className="absolute -bottom-12 left-4 sm:left-8">
        <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full border-4 border-white overflow-hidden shadow-md">
          <Image
            src={avatar}
            alt="avatar"
            fill
            className="object-cover"
          />
        </div>
      </div>

      {/* NAME + META */}
      <div className="mt-16 px-4 sm:px-8">
        <h1 className="text-xl sm:text-2xl font-bold">
          {profile.name}
        </h1>
        <p className="text-sm text-muted-foreground">
          Blog cá nhân
        </p>
      </div>
    </div>
  );
}