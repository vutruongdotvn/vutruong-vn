"use client";

import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useEffect, useRef, useState } from "react";

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
  className = "",
  onOpenCreatePost,
  onOpenLogin,
}: BlogUserCardProps) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastScrollY.current = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (!ticking.current) {
        window.requestAnimationFrame(() => {
          const diff = currentScrollY - lastScrollY.current;

          // Luôn hiện khi đang ở gần đầu trang
          if (currentScrollY < 120) {
            setVisible(true);
          }
          // Scroll xuống đủ rõ -> ẩn
          else if (diff > 5) {
            setVisible(false);
          }
          // Scroll lên đủ rõ -> hiện
          else if (diff < -5) {
            setVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking.current = false;
        });

        ticking.current = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div
      className={`
        userWrap
        fixed left-1/2 -translate-x-1/2 z-49
        w-[calc(100%-0rem)] max-w-xs sm:max-w-sm
        transition-all duration-300 ease-out will-change-transform
        ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0 pointer-events-none"}
        ${className}
      `}
      style={{
        bottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        className="
          flex items-center justify-between gap-3
          rounded-full border border-white/70 bg-white/80 backdrop-blur-md
          shadow-[0_8px_30px_rgba(0,0,0,0.05)] transition-all duration-300
          hover:shadow-[0_12px_40px_rgba(0,0,0,0.15)]
          px-3 py-2
        "
      >
        {/* LEFT */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link href="/profile" className="shrink-0">
            <Image
              height={44}
              width={44}
              alt="avatar"
              src={avatar}
              className="size-11 rounded-full object-cover"
            />
          </Link>

          <div className="min-w-0 flex-1">
            <p className="font-semibold text-base text-gray-900 flex items-center gap-[3px] leading-5 truncate">
              <span className="truncate">{fullName}</span>

              {user && role === "admin" && (
                <i
                  className="fa-duotone fa-badge-check text-blue-500 hover:text-blue-600 cursor-pointer text-xs shrink-0"
                  title="Tài khoản đã xác thực"
                ></i>
              )}
            </p>

            <p className="text-sm font-normal text-gray-500 leading-5 truncate">
              {user ? email : ""}
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-2 shrink-0">
          {user && role === "admin" && (
            <button
              onClick={onOpenCreatePost}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white hover:bg-gray-800 hover:text-white active:scale-90 transition-all cursor-pointer"
              title="Đăng bài"
            >
              <i className="fa-duotone fa-pen-to-square"></i>
            </button>
          )}

          {!user ? (
            <button
              onClick={onOpenLogin}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white hover:bg-gray-800 hover:text-white active:scale-90 transition-all cursor-pointer"
              title="Đăng nhập"
            >
              <i className="fa-duotone fa-user-gear"></i>
            </button>
          ) : (
            <button
              onClick={async () => {
                const { error } = await supabase.auth.signOut();

                if (error) {
                  console.error("Sign out error:", error);
                  return;
                }

                // window.location.reload();
              }}
              className="w-11 h-11 flex items-center justify-center rounded-full bg-white hover:bg-gray-800 hover:text-white active:scale-90 transition-all cursor-pointer"
              title="Đăng xuất"
            >
              <i className="fa-duotone fa-arrow-right-from-bracket"></i>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}