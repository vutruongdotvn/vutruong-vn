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
          <div className="h-[40px] w-[40px] shrink-0 animate-pulse rounded-full bg-gray-200" />

          <div className="h-[40px] min-w-0 flex-1 animate-pulse rounded-full bg-gray-100" />

          <div className="flex shrink-0 items-center gap-0 sm:gap-1">
            <div className="h-10 w-8 animate-pulse rounded-xl bg-gray-100 sm:w-10" />
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2 transition-shadow duration-300 sm:gap-3 p-3 sm:p-4 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="shrink-0 cursor-pointer rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 pointer-events-none"
            aria-label="Mở hộp đăng bài viết"
          >
            <Image
              src={avatar}
              alt={displayName}
              width={40}
              height={40}
              unoptimized
              className="h-[40px] w-[40px] rounded-full object-cover"
            />
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-[40px] min-w-0 flex-1 cursor-pointer truncate rounded-full bg-gray-100 px-4 text-left text-[15px] font-normal text-gray-500 transition-colors hover:bg-gray-200/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 sm:text-base"
          >
            {callName} ơi, có điều gì muốn chia sẻ không?
          </button>

          <div className="flex shrink-0 items-center gap-0 sm:gap-1">

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex h-10 w-8 cursor-pointer items-center justify-center rounded-xl text-emerald-500 transition-colors hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-emerald-500 sm:w-10"
              aria-label="Thêm ảnh"
            >
              <i className="fa-duotone fa-images text-xl" />
            </button>

          </div>
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