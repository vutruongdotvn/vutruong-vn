"use client";

import { useState } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import LoginModal from "@/components/auth/LoginModal";

export default function WatchGuard({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  // LOGIC BẢO MẬT: Phải đăng nhập VÀ có role là admin (hoặc danh sách email được duyệt)
  // Tạm thời mình lấy role "admin" theo hook useUser của bạn.
  const isAuthorized = user && role === "admin";

  // 1. Đang kiểm tra token
  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black">
        <i className="fa-duotone fa-shield-exclamation text-3xl sm:text-7xl text-red-500 animate-pulse"></i>
      </div>
    );
  }

  // 2. Không có quyền truy cập
  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black px-4 text-center text-white">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10">
          <i className="fa-duotone fa-lock-keyhole text-5xl text-red-500" />
        </div>
        
        <h1 className="mb-3 text-lg sm:text-2xl font-bold tracking-tight">Nội dung bị khóa</h1>
        
        <p className="mb-8 max-w-md text-slate-400 text-sm sm:text-base">
          Liên hệ quản trị viên để được cấp quyền xem nội dung này.
        </p>
        
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3">
          {!user && (
            <button
              onClick={() => setShowLogin(true)}
              className="flex items-center gap-2 rounded-full bg-red-600 px-8 py-3 font-semibold text-white text-sm sm:text-base transition-all hover:bg-red-500 active:scale-95 cursor-pointer shadow-[0_0_20px_rgba(220,38,38,0.4)]"
            >
              <i className="fa-duotone fa-user-lock" />
              Đăng nhập
            </button>
          )}

          <Link
            href="/watch" prefetch={false}
            className="flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-8 py-3 font-semibold text-sm sm:text-base text-white transition-all hover:bg-white/20 active:scale-95"
          >
            <i className="fa-duotone fa-arrow-left" />
            Về trang chủ
          </Link>
        </div>

        {/* Gọi Modal Đăng nhập nếu ấn nút */}
        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    );
  }

  // 3. Hợp lệ -> Cho phép xem phim
  return <>{children}</>;
}