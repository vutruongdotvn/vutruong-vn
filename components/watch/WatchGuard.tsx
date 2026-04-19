"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/hooks/useUser";
import LoginModal from "@/components/auth/LoginModal";
import { supabase } from "@/lib/supabase";

export default function WatchGuard({ children }: { children: React.ReactNode }) {
  const { user, role, status, loading } = useUser();
  const [showLogin, setShowLogin] = useState(false);

  // LOGIC PHÊ DUYỆT: Admin hoặc User có status approved
  const isAuthorized = user && (role === "admin" || status === "approved");

  // 💡 Debug Tool: In ra console để theo dõi
  useEffect(() => {
    if (!loading) {
      // console.log("👉 Đang đăng nhập:", user?.email || "Chưa");
      // console.log("👉 Role trong DB:", role);
      // console.log("👉 Status trong DB:", status);
    }
  }, [user, role, status, loading]);

  if (loading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-black">
        <img src="/logo.png" className="size-24 sm:size-30"/>
      </div>
    );
  }

  // NẾU KHÔNG CÓ QUYỀN VÀO XEM PHIM
  if (!isAuthorized) {
    // 1. Mặc định là khách chưa đăng nhập
    let config = {
      icon: "fa-lock-keyhole", color: "bg-red-500/10 border border-red-500/20", iconColor: "text-red-500",
      title: "Truy cập bị từ chối", desc: "Bạn không có quyền xem nội dung này"
    };

    // 2. NẾU ĐÃ ĐĂNG NHẬP, phân loại theo trạng thái
    if (user) {
      if (status === "banned") {
        config = {
          icon: "fa-ban", color: "bg-red-500/10 border border-red-500/20", iconColor: "text-red-500",
          title: "Tài khoản bị cấm", desc: "Tài khoản này đã bị cấm do vi phạm quy định sử dụng"
        };
      } else if (status === "rejected") {
        config = {
          icon: "fa-user-slash", color: "bg-red-500/10 border border-red-500/20", iconColor: "text-red-500",
          title: "Yêu cầu bị từ chối", desc: "Tài khoản của bạn không đủ điều kiện được cấp quyền sử dụng"
        };
      } else if (status === "revoked") {
        config = {
          icon: "fa-shield-slash", color: "bg-red-500/10 border border-red-500/20", iconColor: "text-red-500",
          title: "Tài khoản bị thu hồi", desc: "Tài khoản của bạn đã bị thu hồi quyền sử dụng"
        };
      } else {
        // Bắt gọn mọi trạng thái còn lại (pending, unknown, lỗi null...) thành Chờ Duyệt
        config = {
          icon: "fa-spinner-third fa-spin", color: "bg-amber-500/10 border border-amber-500/20", iconColor: "text-amber-500",
          title: "Tài khoản đang chờ phê duyệt", desc: "Tài khoản được phê duyệt mới có thể xem nội dung này"
        };
      }
    }

    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black px-4 text-center text-white">
        <div className={`mb-6 flex size-20 items-center justify-center rounded-full ${config.color}`}>
          <i className={`fad ${config.icon} text-4xl ${config.iconColor}`} />
        </div>
        
        <h1 className="mb-3 text-lg sm:text-2xl font-bold tracking-tight">{config.title}</h1>
        <p className="mb-8 max-w-lg text-slate-400 text-sm sm:text-base">{config.desc}</p>
        
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-3">
          {!user ? (
            <button onClick={() => setShowLogin(true)} className="flex items-center gap-2 rounded-full bg-red-600 px-8 py-3 font-semibold text-white text-sm sm:text-base transition-all hover:bg-red-500 active:scale-95 shadow-[0_0_20px_rgba(220,38,38,0.4)] cursor-pointer">
              <i className="fa-duotone fa-user-lock" /> Đăng nhập
            </button>
          ) : (
            <button onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }} className="flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-8 py-3 font-semibold text-white text-sm sm:text-base transition-all hover:bg-white/20 active:scale-95 cursor-pointer">
              <i className="fa-duotone fa-sign-out" /> Đăng xuất
            </button>
          )}

          <Link href="/watch" prefetch={false} className="flex items-center gap-2 rounded-full bg-white/10 border border-white/10 px-8 py-3 font-semibold text-sm sm:text-base text-white transition-all hover:bg-white/20 active:scale-95">
            <i className="fa-duotone fa-arrow-left" /> Về trang chủ
          </Link>
        </div>

        {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      </div>
    );
  }

  return <>{children}</>;
}