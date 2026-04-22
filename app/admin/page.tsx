"use client";

import { useEffect, useState } from "react";
import { useUser, UserStatus } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";

type Profile = {
  id: string;
  email: string;
  role: string;
  status: UserStatus;
  created_at?: string;
};

export default function AdminUsersPage() {
  const { user, role, loading: authLoading } = useUser();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ✅ LOGIC MỚI: Trạng thái đánh dấu lần load đầu tiên
  const [isInitialAuth, setIsInitialAuth] = useState(true);

  useEffect(() => {
    if (!authLoading) setIsInitialAuth(false);
  }, [authLoading]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      if (data) {
        // 🎯 Lớp giáp chuẩn hóa dữ liệu: Cắt mọi khoảng trắng, đưa về chữ thường
        // Điều này đảm bảo triệt để lỗi "mất nút" do DB bị dính khoảng trắng ngầm
        const normalizedData = data.map(p => ({
          ...p,
          role: p.role?.toLowerCase().trim() || "user",
          status: p.status?.toLowerCase().trim() || "unknown"
        })) as Profile[];
        
        setProfiles(normalizedData);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách user:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === "admin") fetchProfiles();
  }, [role]);

  const handleUpdateStatus = async (email: string, newStatus: UserStatus) => {
    setActionLoading(email);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ status: newStatus })
        .eq("email", email);

      if (error) {
        alert("Lỗi khi cập nhật: " + error.message);
        throw error;
      }

      setProfiles((prev) =>
        prev.map((p) => (p.email === email ? { ...p, status: newStatus } : p))
      );
    } catch (error) {
      console.error("Update failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  // 1. Loading State (Đã sửa điều kiện: chỉ chớp loading ở lần đầu isInitialAuth)
  if ((authLoading && isInitialAuth) || (user && role !== "admin" && loading)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <i className="fa-duotone fa-shield-exclamation animate-pulse text-6xl text-red-500"></i>
      </div>
    );
  }

  // 2. Chặn truy cập (Access Denied) (Đã sửa điều kiện: thêm !authLoading)
  if (!authLoading && (!user || role !== "admin")) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <PremiumGlassCard contentClassName="text-center">
          <div className="size-16 mb-6 flex items-center mx-auto justify-center rounded-full bg-red-50 border border-red-200">
            <i className="fa-duotone fa-lock-keyhole text-3xl text-red-500"></i>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800 mb-1.5">Truy cập bị từ chối</h1>
          <p className="text-sm sm:text-base text-gray-500 mb-8">
            Bạn không có quyền truy cập vào trang này.
          </p>
          <Link href="/" className="flex items-center gap-3 justify-center mt-6 mx-auto px-6 py-3 bg-slate-900 text-white text-sm font-medium rounded-full hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 active:scale-95 w-sm max-w-full">
            <i className="fad fa-arrow-left"/> Về Trang chủ
          </Link>
        </PremiumGlassCard>
      </div>
    );
  }

  // 3. Giao diện chính (Grid System + Mobile Responsive)
  return (
    <div className="min-h-screen py-26 px-4 sm:px-8 relative overflow-hidden">
      {/* Background Blobs Glassmorphism */}
      <div className="fixed top-0 left-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob pointer-events-none"></div>
      <div className="fixed top-0 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000 pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4 bg-white/50 p-5 sm:p-6 rounded-3xl backdrop-blur-xl border border-white shadow-sm">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold flex items-center gap-3 text-slate-800">
              <i className="fa-duotone fa-users-gear text-blue-600"></i>
              Quản lý Người dùng
            </h1>
            <p className="text-slate-500 mt-1.5 text-xs sm:text-sm">
              Phê duyệt, thu hồi quyền truy cập hệ thống của các thành viên.
            </p>
          </div>
          <div className="bg-white border border-slate-100 shadow-sm px-4 py-2.5 rounded-2xl flex items-center gap-2 text-slate-600 w-full sm:w-auto justify-center">
            <i className="fa-duotone fa-chart-user text-blue-500"></i>
            <span className="font-bold text-slate-800">{profiles.length}</span> <span className="text-sm">thành viên</span>
          </div>
        </div>

        {/* User Grid Cards (Mobile xịn xò) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/50 backdrop-blur-md rounded-3xl border border-white shadow-sm">
            <i className="fa-duotone fa-spinner-third animate-spin text-4xl mb-3 text-blue-500"></i>
            <p>Đang đồng bộ dữ liệu...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 bg-white/50 backdrop-blur-md rounded-3xl border border-white shadow-sm">
            <i className="fa-duotone fa-ghost text-4xl mb-3 text-slate-300"></i>
            <p>Chưa có người dùng nào trong hệ thống.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {profiles.map((p) => (
              <div 
                key={p.id} 
                className="group relative bg-white/70 backdrop-blur-2xl border border-white/80 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] rounded-3xl p-5 sm:p-6 transition-all duration-300 flex flex-col h-full"
              >
                {/* Header Card: Email & Role */}
                <div className="flex justify-between items-start gap-2 mb-4">
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-slate-800 text-sm sm:text-base truncate" title={p.email}>
                      {p.email}
                    </h3>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wider ${
                        p.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-600"
                      }`}>
                        {p.role}
                      </span>
                      {p.role === "admin" && (
                        <span className="ml-1.5 inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-xs font-bold uppercase bg-blue-100 text-blue-600 border border-blue-200">
                          Bạn
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Badge Trạng Thái */}
                  <div className="shrink-0">
                    <StatusBadge status={p.status} />
                  </div>
                </div>

                {/* Spacer đẩy các nút xuống đáy */}
                <div className="flex-grow"></div>

                {/* Footer Card: Nút Thao Tác (Responsive Action Buttons) */}
                <div className="mt-4 pt-4 border-t border-slate-100/80">
                  {actionLoading === p.email ? (
                    <div className="w-full flex justify-center py-2 bg-slate-50 rounded-xl">
                      <i className="fa-duotone fa-spinner-third animate-spin text-2xl text-blue-500"></i>
                    </div>
                  ) : p.role === "admin" ? (
                    <div className="w-full text-center py-2.5 text-xs sm:text-sm text-emerald-500 font-medium bg-slate-50/50 rounded-xl border border-slate-100">
                      <i className="fa-duotone fa-shield-check mr-1 text-emerald-500"></i>
                      Tài khoản tối cao
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:gap-3 w-full">
                      {/* Cột 1: Phê Duyệt hoặc Thu Hồi */}
                      {p.status === "approved" ? (
                        <button
                          onClick={() => handleUpdateStatus(p.email, "revoked")}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-100 transition-all font-semibold text-xs sm:text-sm shadow-sm active:scale-95"
                        >
                          <i className="fa-duotone fa-shield-slash text-base"></i> <span className="truncate">Thu hồi</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(p.email, "approved")}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white border border-emerald-100 transition-all font-semibold text-xs sm:text-sm shadow-sm active:scale-95"
                        >
                          <i className="fa-duotone fa-check-circle text-base"></i> <span className="truncate">Phê duyệt</span>
                        </button>
                      )}

                      {/* Cột 2: Khóa hoặc Mở Khóa */}
                      {p.status === "banned" ? (
                        <button
                          onClick={() => handleUpdateStatus(p.email, "pending")}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-600 hover:text-white border border-slate-200 transition-all font-semibold text-xs sm:text-sm shadow-sm active:scale-95"
                        >
                          <i className="fa-duotone fa-unlock text-base"></i> <span className="truncate">Bỏ cấm</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateStatus(p.email, "banned")}
                          className="flex items-center justify-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-100 transition-all font-semibold text-xs sm:text-sm shadow-sm active:scale-95"
                        >
                          <i className="fa-duotone fa-ban text-base"></i> <span className="truncate">Khóa</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>

              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Badge UI
function StatusBadge({ status }: { status: UserStatus }) {
  const configs: Record<string, { color: string; text: string; icon: string }> = {
    pending: { color: "bg-amber-100 text-amber-700 border-amber-200", text: "Chờ duyệt", icon: "fa-hourglass-clock" },
    approved: { color: "bg-emerald-100 text-emerald-700 border-emerald-200", text: "Đã duyệt", icon: "fa-check-circle" },
    banned: { color: "bg-red-100 text-red-700 border-red-200", text: "Bị cấm", icon: "fa-ban" },
    rejected: { color: "bg-slate-200 text-slate-700 border-slate-300", text: "Từ chối", icon: "fa-user-slash" },
    revoked: { color: "bg-orange-100 text-orange-700 border-orange-200", text: "Thu hồi", icon: "fa-shield-slash" },
    unknown: { color: "bg-gray-100 text-gray-500 border-gray-200", text: "Không rõ", icon: "fa-question" },
  };

  const config = configs[status || "unknown"] || configs.unknown;

  return (
    <span className={`inline-flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold border ${config.color} shadow-sm text-center`}>
      <i className={`fa-duotone ${config.icon} text-sm`}></i>
      <span>{config.text}</span>
    </span>
  );
}