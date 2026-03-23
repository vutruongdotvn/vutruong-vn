"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return alert("Nhập đủ email + password bro!");
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert(error.message);
    } else {
      // alert("Login thành công 🚀");
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white p-5 rounded-xl w-full max-w-sm">
        <h2 className="font-semibold mb-3">Đăng nhập</h2>

        <input
          type="email"
          placeholder="Nhập email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <input
          type="password"
          placeholder="Nhập password..."
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-2 rounded mb-3"
        />

        <button
          onClick={handleLogin}
          className="w-full bg-blue-500 text-white py-2 rounded"
        >
          {loading ? "Đang login..." : "Đăng nhập"}
        </button>

        <button
          onClick={onClose}
          className="mt-2 text-sm text-gray-500 w-full"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}