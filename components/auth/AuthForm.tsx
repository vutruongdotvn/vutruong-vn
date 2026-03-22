"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      return alert("Nhập email + password bro!");
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      alert("Lỗi login: " + error.message);
    } else {
      alert("Login thành công 🚀");
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm">
      <h3 className="font-semibold mb-2">Đăng nhập</h3>

      <input
        type="email"
        placeholder="Nhập email..."
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-3"
      />

      <input
        type="password"
        placeholder="Nhập password..."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-3"
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded-lg"
      >
        {loading ? "Đang login..." : "Đăng nhập"}
      </button>
    </div>
  );
}