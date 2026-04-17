"use client";

import { useEffect, useState } from "react";
import { notFound } from "next/navigation";
import { useUser } from "@/hooks/useUser";

export default function SecretLayout({ children }: { children: React.ReactNode }) {
  const { user, role, loading } = useUser();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (user && role === "admin") {
        // ✅ Xác nhận là Admin
        setIsAuthorized(true);
      }
    }
  }, [user, role, loading]);

  // 🚨 Kẻ xâm nhập -> Báo 404 ngay trong quá trình render
  if (!loading && (!user || role !== "admin")) {
    notFound();
  }

  // Màn hình chờ trong lúc check phiên đăng nhập
  if (loading || !isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50/50">
        <i className="fa-duotone fa-shield-check fa-beat-fade text-4xl text-sky-600"></i>
      </div>
    );
  }

  // ✅ Hiển thị nội dung Khu vực tuyệt mật
  return (
    <div className="min-h-screen bg-slate-50/80">
      {children}
    </div>
  );
}