"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";
import Link from "next/link";

export default function SecretGuard({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // 1. Kiểm tra quyền truy cập
  useEffect(() => {
    if (!loading) {
      if (user && role === "admin") {
        setIsAuthorized(true);
      }
    }
  }, [user, role, loading]);

  // 2. Đổi Title động theo trạng thái trên Client
  useEffect(() => {
    if (!loading && (!user || role !== "admin")) {
      document.title = "Truy cập bị từ chối";
    } else if (loading || !isAuthorized) {
      document.title = "Đang xác thực...";
    } else {
      document.title = "Secret";
    }
  }, [loading, user, role, isAuthorized]);

  // 🚨 Kẻ xâm nhập -> Hiển thị thẻ thông báo Truy cập bị từ chối
  if (!loading && (!user || role !== "admin")) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50/80 p-4">
        <PremiumGlassCard
          className="w-full max-w-xl hover:-translate-y-1 transition-transform duration-500 ease-out shadow-[0_18px_70px_rgba(0,0,0,0.06)]"
          contentClassName="px-6 py-12 sm:px-24 sm:py-20 flex flex-col items-center text-center"
        >
          {/* Icon Container */}
          <div className="size-16 mb-6 flex items-center mx-auto justify-center rounded-full bg-red-50 border border-red-200">
            <i className="fa-duotone fa-lock-keyhole text-3xl text-red-500" />
          </div>

          {/* Nội dung thông báo */}
          <h2 className="text-xl font-extrabold text-gray-900 mb-2 tracking-tight">Truy cập bị từ chối</h2>
          <p className="text-sm text-gray-500 mb-8">
            Bạn không có quyền truy cập vào trang này.
          </p>

          {/* Nút điều hướng lối thoát */}
          <Link
            href="/"
            className="w-full py-3 px-4 bg-gray-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            OK
          </Link>
        </PremiumGlassCard>
      </div>
    );
  }

  // ⏳ Màn hình chờ trong lúc check phiên đăng nhập
  if (loading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
        <div className="flex flex-col items-center gap-4">
          <i className="fa-duotone fa-shield-check fa-beat-fade text-5xl text-sky-600"></i>
        </div>
      </div>
    );
  }

  // ✅ Hiển thị nội dung Khu vực tuyệt mật (Khi đã là Admin)
  return (
    <div className="secretRoute">
      {children}
    </div>
  );
}