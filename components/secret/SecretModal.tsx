"use client";
import { useEffect, useState } from "react";
import SecretField from "./SecretField";

export type SecretModalProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    brand: string; title: string; username?: string|null; password?: string|null; email?: string|null; phone?: string|null;
  }) => void;
  initialData?: { brand: string; title: string; username?: string|null; password?: string|null; email?: string|null; phone?: string|null; };
};

export default function SecretModal({ open, onClose, onSubmit, initialData }: SecretModalProps) {
  const [form, setForm] = useState({
    brand: "", title: "", username: "", password: "", email: "", phone: ""
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        brand: initialData.brand,
        title: initialData.title,
        username: initialData.username || "",
        password: initialData.password || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
      });
    }
  }, [initialData]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-full max-w-lg mx-2 rounded-lg animate-fadeIn">
        <h2 className="text-xl font-semibold mb-4">{initialData ? "Sửa Secret" : "Thêm Secret"}</h2>
        <form onSubmit={e => { e.preventDefault(); onSubmit({
            brand: form.brand.trim(), title: form.title.trim(),
            username: form.username.trim() || null,
            password: form.password.trim() || null,
            email: form.email.trim() || null,
            phone: form.phone.trim() || null
          }); onClose(); }}>
          <div className="grid gap-4">
            <div>
              <label className="text-sm font-medium">Brand *</label>
              <input className="w-full border border-zinc-200 p-2 rounded" value={form.brand}
                onChange={e => setForm(f => ({ ...f, brand: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium">Title *</label>
              <input className="w-full border border-zinc-200 p-2 rounded" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
            </div>
            <div>
              <label className="text-sm font-medium">Username</label>
              <input className="w-full border border-zinc-200 p-2 rounded" value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Password</label>
              <input type="password" className="w-full border border-zinc-200 p-2 rounded" value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input className="w-full border border-zinc-200 p-2 rounded" value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input className="w-full border border-zinc-200 p-2 rounded" value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="mt-4 flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Hủy</button>
            <button type="submit" className="px-4 py-2 bg-zinc-900 text-white rounded">
              {initialData ? "Cập nhật" : "Thêm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
