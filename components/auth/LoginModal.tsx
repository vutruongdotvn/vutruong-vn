"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  const handleLogin = async () => {
    if (!email.trim() && !password.trim()) {
      showToast("Ê?", "warning");
      return;
    }

    if (!email.trim()) {
      showToast("Ê??", "warning");
      return;
    }

    if (!password.trim()) {
      showToast("Ê???", "warning");
      return;
    }

    if (loading) return;

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      console.error("Login error:", error);
      showToast("Êeeeeeee?", "error");
      setLoading(false);
      return;
    }

    showToast("Dzô", "success");
    setLoading(false);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  if (!mounted) return null;

  return createPortal(
    <div className="fixed inset-0 h-screen z-[9998] flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-2xl p-4 mx-2 z-10 animate-fadeIn">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-semibold text-lg"><i className="fa-duotone fa-solid fa-arrow-left-to-arc mr-2"></i>Đăng nhập</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-black cursor-pointer"
          >
            <i className="fa-duotone fa-times" />
          </button>
        </div>

        {/* BODY */}
        <div className="mt-4 space-y-3">
          <input
            type="email"
            placeholder="vutruong.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-gray-200"
          />

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full border rounded-xl px-3 py-2 outline-none focus:ring-1 focus:ring-gray-200"
          />
        </div>

        {/* FOOTER */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-800 active:scale-98 transition text-white py-2 rounded-full font-semibold disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Đang xác thực" : "Đăng nhập"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}