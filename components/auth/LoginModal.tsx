"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState(""); // ✅ State mới cho Họ tên
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const handleAction = async () => {
    if (isRegister && !name.trim()) {
      showToast("Vui lòng nhập họ tên", "warning");
      return;
    }

    if (!email.trim() || !password.trim()) {
      showToast("Vui lòng điền đầy đủ thông tin", "warning");
      return;
    }

    if (isRegister && password !== confirmPassword) {
      showToast("Mật khẩu xác nhận không khớp", "error");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        // ✅ ĐĂNG KÝ: Gửi name vào options.data
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              name: name.trim(), // Metadata này sẽ được Trigger lấy ra
            }
          }
        });
        if (error) throw error;
        showToast("Đăng ký thành công và đang chờ phê duyệt.", "success");
        onClose();
      } else {
        // ĐĂNG NHẬP
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        showToast("Chào mừng bạn trở lại hệ thống!", "success");
        onClose();
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      showToast(error.message || "Có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAction();
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white/95 backdrop-blur-2xl border border-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-6 sm:p-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 overflow-hidden">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 size-8 flex items-center justify-center rounded-full bg-slate-100/50 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <i className="fa-duotone fa-times text-lg" />
        </button>

        <div className="mb-8 pr-8">
          <div className="size-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 border border-blue-100 shadow-sm">
            <i className={`fa-duotone ${isRegister ? "fa-user-plus" : "fa-shield-keyhole"} text-2xl`} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
            {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
          </h2>
          <p className="text-sm text-slate-500 mt-1.5 font-medium">
            {isRegister ? "Tham gia hệ sinh thái VT Zone ngay hôm nay." : "Để sử dụng hệ sinh thái VT Zone."}
          </p>
        </div>

        <div className="space-y-4">
          {/* ✅ Ô Họ tên (Chỉ hiện khi Đăng ký) */}
          <div className={`grid transition-all duration-300 ease-in-out ${isRegister ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
              <div className="relative group pb-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                  <i className="fa-duotone fa-user" />
                </div>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <i className="fa-duotone fa-envelope" />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <i className="fa-duotone fa-lock-keyhole" />
            </div>
            <input
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => {
                const value = e.target.value;

                if (/^\d*$/.test(value)) {
                  setPassword(value);
                }
              }}
              onKeyDown={handleKeyDown}
              className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className={`grid transition-all duration-300 ease-in-out ${isRegister ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
              <div className="relative group pt-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors pt-1">
                  <i className="fa-duotone fa-shield-check" />
                </div>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-slate-50/50 border border-slate-200 rounded-2xl pl-11 pr-4 py-3.5 text-slate-800 placeholder-slate-400 outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleAction}
            disabled={loading}
            className="relative w-full overflow-hidden rounded-2xl bg-slate-900 text-white py-4 font-bold tracking-wide shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-black active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            <span className="flex items-center justify-center gap-2">
              {loading ? (
                <i className="fa-duotone fa-spinner-third animate-spin text-xl" />
              ) : (
                <>
                  {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
                  <i className="fa-regular fa-arrow-right ml-1 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>

          {/*
          <div className="mt-6 text-center">
            <span className="text-sm text-slate-500">
              {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
            </span>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setName("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-sm font-bold text-blue-600 hover:text-blue-700 hover:underline underline-offset-4 transition-all cursor-pointer"
            >
              {isRegister ? "Đăng nhập" : "Đăng ký ngay"}
            </button>
          </div>
          */}

        </div>
      </div>
    </div>,
    document.body
  );
}