"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

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
      // alert(error.message);
      return;
    } else {
      // alert("Login thành công 🚀");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-xl w-full max-w-sm">
        <h2 className="font-semibold mb-3">Đăng nhập</h2>

        <input
          type="email"
          placeholder="admin@vutruong.vn"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          required
        />

        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-3"
          required
        />

        <div className="flex items-center gap-2">
        <button
          onClick={handleLogin}
          className="bg-blue-600 py-2 text-white w-50 rounded cursor-pointer hover:bg-blue-700 active:bg-blue-800 text-sm"
        >
          {loading ? "Đang xác thực" : "Đăng nhập"}
        </button>

        <button
          onClick={onClose}
          className="bg-gray-200 py-2 text-gray-500 w-50 rounded cursor-pointer hover:bg-gray-300 active:bg-gray-400 text-sm hover:text-gray-600"
        >
          Đóng
        </button>
        </div>
      </div>
    </div>
  );
}