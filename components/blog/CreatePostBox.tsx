"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import CreatePostModal from "@/components/blog/CreatePostModal";
import { getAvatarImage } from "@/lib/cloudinary";
import { supabase } from "@/lib/supabase";

type CreatePostBoxProps = {
  user: User;
  authLoading?: boolean;
  visible?: boolean;
};

type Profile = {
  name: string | null;
  avatar: string | null;
};

export default function CreatePostBox({
  user,
  authLoading = false,
  visible = true,
}: CreatePostBoxProps) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let active = true;

    const loadProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name, avatar")
        .eq("id", user.id)
        .maybeSingle();

      if (!active) return;

      if (error) {
        console.warn("Không thể tải profile cho CreatePostBox:", error.message);
        setProfile(null);
      } else {
        setProfile(data);
      }

      setProfileLoading(false);
    };

    void loadProfile();

    return () => {
      active = false;
    };
  }, [user.id]);

  const displayName =
    profile?.name?.trim() ||
    user.user_metadata?.full_name?.trim() ||
    user.user_metadata?.name?.trim() ||
    "Vũ Trường";
  const nameParts = displayName.split(/\s+/);
  const callName = nameParts[nameParts.length - 1] || displayName;
  const avatar = getAvatarImage(
    profile?.avatar ||
      user.user_metadata?.avatar_url ||
      user.user_metadata?.picture,
  );
  const loading = authLoading || profileLoading;

  return (
    <div className={visible ? "createPostBox" : "hidden"} aria-hidden={!visible}>
      {loading ? (
        <div
          className="flex items-center gap-2 sm:gap-3 rounded-0 sm:rounded-2xl p-3 sm:p-4"
          aria-label="Đang tải hộp đăng bài viết"
          aria-busy="true"
        >
          <div className="h-[30px] w-[30px] shrink-0 animate-pulse rounded-full bg-secondary" />

          <div className="h-[30px] max-w-64 flex-1 animate-pulse rounded-full bg-muted" />

        </div>
      ) : (
        <div className="flex items-center gap-2 transition-shadow duration-300 sm:gap-2 p-3 sm:p-4 border-b border-border">
          <button
            type="button"
            className="shrink-0 rounded-full"
            aria-label="Mở hộp đăng bài viết"
          >
            <Image
              src={avatar}
              alt={displayName}
              width={30}
              height={30}
              unoptimized
              className="h-[30px] w-[30px] rounded-full object-cover"
            />
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            title="Đăng bài viết mới"
            className="h-[30px] min-w-0 flex-1 cursor-pointer truncate rounded-full text-left text-[.9375rem]/6 font-normal text-foreground/75 hover:text-foreground"
          >
            <span className="font-medium">{callName}</span> ơi, hôm nay có gì vui không?
          </button>


        </div>
      )}

      <CreatePostModal
        isOpen={modalOpen}
        editingPost={null}
        onSuccess={(newPost) => {
          if (!newPost) return;

          window.dispatchEvent(
            new CustomEvent("blog-post-created", { detail: newPost }),
          );
        }}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}