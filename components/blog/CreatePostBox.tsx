"use client";

import Image from "next/image";
import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import CreatePostModal from "@/components/blog/CreatePostModal";
import { getAvatarImage } from "@/lib/cloudinary";
import type { UserProfile } from "@/hooks/useUser";

type CreatePostBoxProps = {
  user: User;
  profile: UserProfile;
  visible?: boolean;
};

export default function CreatePostBox({
  user,
  profile,
  visible = true,
}: CreatePostBoxProps) {
  const [modalOpen, setModalOpen] = useState(false);

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

  return (
    <div className={visible ? "createPostBox" : "hidden"} aria-hidden={!visible}>
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
