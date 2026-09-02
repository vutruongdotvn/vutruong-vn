"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";

type AuthErrorDetails = {
  code: string | null;
  message: string;
  name: string;
  status: number | null;
};

const NETWORK_ERROR_PATTERN =
  /failed to fetch|fetch failed|network\s*error|network request failed|load failed|err_network/i;

function getAuthErrorDetails(error: unknown): AuthErrorDetails {
  if (typeof error === "string") {
    return {
      code: null,
      message: error,
      name: "AuthError",
      status: null,
    };
  }

  if (!error || typeof error !== "object") {
    return {
      code: null,
      message: "",
      name: "UnknownAuthError",
      status: null,
    };
  }

  const candidate = error as {
    code?: unknown;
    message?: unknown;
    name?: unknown;
    status?: unknown;
  };

  return {
    code: typeof candidate.code === "string" ? candidate.code : null,
    message: typeof candidate.message === "string" ? candidate.message : "",
    name: typeof candidate.name === "string" ? candidate.name : "AuthError",
    status: typeof candidate.status === "number" ? candidate.status : null,
  };
}

function getAuthErrorMessage(error: unknown, isRegister: boolean) {
  const { code, message, status } = getAuthErrorDetails(error);

  if (NETWORK_ERROR_PATTERN.test(message)) {
    return "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng và thử lại.";
  }

  if (status === 429) {
    return "Bạn đã thử quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.";
  }

  switch (code) {
    case "invalid_credentials":
      return "Email hoặc mật khẩu không chính xác.";
    case "email_not_confirmed":
      return "Email chưa được xác nhận. Vui lòng kiểm tra hộp thư.";
    case "user_banned":
      return "Tài khoản của bạn đang bị khóa.";
    case "over_request_rate_limit":
      return "Bạn đã thử quá nhiều lần. Vui lòng đợi vài phút rồi thử lại.";
    case "request_timeout":
      return "Yêu cầu đã quá thời gian chờ. Vui lòng thử lại.";
    case "email_address_invalid":
    case "validation_failed":
      return "Thông tin tài khoản không hợp lệ.";
    case "weak_password":
      return "Mật khẩu chưa đáp ứng yêu cầu bảo mật.";
    case "email_exists":
    case "user_already_exists":
      return "Email này đã được đăng ký.";
    case "signup_disabled":
    case "email_provider_disabled":
      return "Tính năng đăng ký hiện không khả dụng.";
    default:
      return isRegister
        ? "Không thể đăng ký lúc này. Vui lòng thử lại."
        : "Không thể đăng nhập lúc này. Vui lòng thử lại.";
  }
}

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState(""); // ✅ State mới cho Họ tên
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

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

  const handleAuthError = (error: unknown) => {
    const details = getAuthErrorDetails(error);

    // Sai thông tin đăng nhập là tình huống dự kiến, không phải lỗi ứng dụng.
    if (details.code !== "invalid_credentials") {
      console.warn("Auth request failed:", details);
    }

    showToast(getAuthErrorMessage(error, isRegister), "error");

    requestAnimationFrame(() => {
      passwordInputRef.current?.focus();
      passwordInputRef.current?.select();
    });
  };

  const handleAction = async () => {
    if (loading) return;

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
            },
          },
        });
        if (error) {
          handleAuthError(error);
          return;
        }

        showToast("Đăng ký thành công và đang chờ phê duyệt.", "success");
        onClose();
      } else {
        // ĐĂNG NHẬP
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) {
          handleAuthError(error);
          return;
        }

        showToast("Chào mừng bạn trở lại hệ thống!", "success");
        onClose();
      }
    } catch (error: unknown) {
      handleAuthError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Enter" || loading) return;

    e.preventDefault();
    void handleAction();
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-card/95 backdrop-blur-2xl border border-border rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] p-6 sm:p-8 animate-in fade-in zoom-in-95 slide-in-from-bottom-4 duration-500 overflow-hidden">

        <button
          onClick={onClose}
          className="absolute top-5 right-5 size-8 flex items-center justify-center rounded-full bg-muted/50 hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
        >
          <i className="fa-duotone fa-times text-lg" />
        </button>

        <div className="mb-8 pr-8">
          <div className="size-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 border border-blue-100 shadow-sm dark:border-blue-400/20 dark:bg-blue-400/15 dark:text-blue-300">
            <i className={`fa-duotone ${isRegister ? "fa-user-plus" : "fa-shield-keyhole"} text-2xl`} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            {isRegister ? "Tạo tài khoản" : "Đăng nhập"}
          </h2>
          <p className="text-sm text-muted-foreground mt-1.5 font-medium">
            {isRegister ? "Tham gia hệ sinh thái VT Zone ngay hôm nay." : "Để sử dụng hệ sinh thái VT Zone."}
          </p>
        </div>

        <div className="space-y-4">
          {/* ✅ Ô Họ tên (Chỉ hiện khi Đăng ký) */}
          <div className={`grid transition-all duration-300 ease-in-out ${isRegister ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
              <div className="relative group pb-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-500 transition-colors">
                  <i className="fa-duotone fa-user" />
                </div>
                <input
                  type="text"
                  placeholder="Họ và tên"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-muted/50 border border-border rounded-2xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-500 transition-colors">
              <i className="fa-duotone fa-envelope" />
            </div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-muted/50 border border-border rounded-2xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-500 transition-colors">
              <i className="fa-duotone fa-lock-keyhole" />
            </div>
            <input
              ref={passwordInputRef}
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
              className="w-full bg-muted/50 border border-border rounded-2xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
            />
          </div>

          <div className={`grid transition-all duration-300 ease-in-out ${isRegister ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
            <div className="overflow-hidden">
              <div className="relative group pt-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-blue-500 transition-colors pt-1">
                  <i className="fa-duotone fa-shield-check" />
                </div>
                <input
                  type="password"
                  placeholder="Xác nhận mật khẩu"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-muted/50 border border-border rounded-2xl pl-11 pr-4 py-3.5 text-foreground placeholder:text-muted-foreground outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <button
            onClick={handleAction}
            disabled={loading}
            className="relative w-full overflow-hidden rounded-2xl bg-primary text-primary-foreground py-4 font-bold tracking-wide shadow-[0_8px_20px_rgba(0,0,0,0.15)] hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed group cursor-pointer"
          >
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary-foreground/20 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
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
            <span className="text-sm text-muted-foreground">
              {isRegister ? "Đã có tài khoản? " : "Chưa có tài khoản? "}
            </span>
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setName("");
                setPassword("");
                setConfirmPassword("");
              }}
              className="text-sm font-bold text-blue-600 dark:text-blue-300 hover:text-blue-700 dark:hover:text-blue-300 hover:underline underline-offset-4 transition-all cursor-pointer"
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
