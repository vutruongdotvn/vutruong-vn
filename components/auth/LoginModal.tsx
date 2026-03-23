"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { supabase } from "@/lib/supabase";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    if (!email || !password) {
      return alert("Ê");
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      return alert("Ê");
    } else {
      onClose();
    }
  };

  // 🔥 THÊM ĐOẠN NÀY
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
      <div className="relative bg-white w-full max-w-md rounded-xl shadow-xl p-4 mx-2 z-10 animate-fadeIn">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-semibold text-lg">Đăng nhập</h2>
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
            placeholder="admin@vutruong.vn"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-gray-200"
          />

          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown} // 🔥 FIX Ở ĐÂY
            className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-1 focus:ring-gray-200"
          />
        </div>

        {/* FOOTER */}
        <div className="flex gap-2 mt-4">
          <button
            onClick={handleLogin}
            disabled={loading}
            className="flex-2 bg-blue-500 hover:bg-blue-600 active:bg-blue-800 transition text-white py-2 rounded-lg font-semibold disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Đang xác thực" : "Đăng nhập"}
          </button>

          <button
            onClick={onClose}
            className="hidden flex-1 bg-gray-200 hover:bg-gray-300 active:bg-gray-400 text-gray-600 py-2 rounded-lg font-semibold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}