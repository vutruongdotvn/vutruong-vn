"use client";

import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";

type BlogUserCardProps = {
  user: any;
  role: "admin" | "user" | null;
  fullName: string;
  email: string;
  avatar: string;
  className?: string;
  onOpenCreatePost?: () => void;
  onOpenLogin?: () => void;
};

export default function BlogUserCard({
  user,
  role,
  fullName,
  email,
  avatar,
  className = "mb-8",
  onOpenCreatePost,
  onOpenLogin,
}: BlogUserCardProps) {
  return (
    <div
      className={`userWrap ${className} flex items-center justify-between gap-3 bg-white/80 backdrop-blur-md
      border border-white/70 p-4 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.04)]`}
    >
      <div className="flex items-center gap-2">
        <Link href="/profile">
          <Image
            height={40}
            width={40}
            alt="avatar"
            src={avatar}
            className="w-10 h-10 rounded-full object-cover shadow-sm bg-white"
            unoptimized={false}
          />
        </Link>

        <div>
          <p className="font-semibold text-base text-gray-900 flex items-center gap-[3px] leading-5">
            {fullName}
            {user && role === "admin" && (
              <i
                className="fa-solid fa-badge-check text-neutral-500 hover:text-neutral-600 cursor-pointer text-xs"
                title="Tài khoản đã xác thực"
              ></i>
            )}
          </p>

          <p className="text-sm font-normal text-gray-500 leading-5">
            {user ? email : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {user && role === "admin" && (
          <button
            onClick={onOpenCreatePost}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/70 hover:bg-white transition border border-gray-100 shadow-sm cursor-pointer"
            title="Đăng bài"
          >
            <i className="fa-duotone fa-pen-to-square text-gray-600"></i>
          </button>
        )}

        {!user ? (
          <button
            onClick={onOpenLogin}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/70 hover:bg-white transition border border-gray-100 shadow-sm cursor-pointer"
            title="Đăng nhập"
          >
            <i className="fa-duotone fa-user-gear text-gray-600"></i>
          </button>
        ) : (
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              location.reload();
            }}
            className="w-11 h-11 flex items-center justify-center rounded-full bg-white/70 hover:bg-white transition border border-gray-100 shadow-sm cursor-pointer"
            title="Đăng xuất"
          >
            <i className="fa-duotone fa-arrow-right-from-bracket text-gray-600"></i>
          </button>
        )}
      </div>
    </div>
  );
}