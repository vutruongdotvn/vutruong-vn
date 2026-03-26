"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";

export default function AuthForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const handleLogin = async () => {
    if (!email.trim() && !password.trim()) {
      showToast("Vui lòng nhập email và mật khẩu", "warning");
      return;
    }

    if (!email.trim()) {
      showToast("Vui lòng nhập email", "warning");
      return;
    }

    if (!password.trim()) {
      showToast("Vui lòng nhập mật khẩu", "warning");
      return;
    }

    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    setLoading(false);

    if (error) {
      showToast("Email hoặc mật khẩu không đúng", "error");
    } else {
      showToast("Đăng nhập thành công", "success");
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
        className="w-full border rounded-xl px-3 py-2 mb-3"
      />

      <input
        type="password"
        placeholder="Nhập password..."
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded-xl px-3 py-2 mb-3"
      />

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded-xl"
      >
        {loading ? "Đang login..." : "Đăng nhập"}
      </button>
    </div>
  );
}