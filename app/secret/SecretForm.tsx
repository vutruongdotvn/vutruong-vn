"use client";

import React, { useEffect, useRef, useState } from "react";
import type { SecretItem } from "./SecretCard";

type SecretFormValues = {
  brand: string;
  title: string;
  username: string;
  password: string;
  email: string;
  phone: string;

  secondary_password: string;
  pin_code: string;
  security_question: string;
  security_answer: string;
  backup_email: string;
  backup_phone: string;
  recovery_codes: string;
  twofa_secret: string;

  login_url: string;
  note: string;
  tags: string;
  is_pinned: boolean;
  is_archived: boolean;
  status: string;
  priority: string;
};

const initialValues: SecretFormValues = {
  brand: "",
  title: "",
  username: "",
  password: "",
  email: "",
  phone: "",

  secondary_password: "",
  pin_code: "",
  security_question: "",
  security_answer: "",
  backup_email: "",
  backup_phone: "",
  recovery_codes: "",
  twofa_secret: "",

  login_url: "",
  note: "",
  tags: "",
  is_pinned: false,
  is_archived: false,
  status: "active",
  priority: "normal",
};

export type SecretPayload = {
  brand: string;
  title: string;
  username: string | null;
  password: string | null;
  email: string | null;
  phone: string | null;

  secondary_password: string | null;
  pin_code: string | null;
  security_question: string | null;
  security_answer: string | null;
  backup_email: string | null;
  backup_phone: string | null;
  recovery_codes: string | null;
  twofa_secret: string | null;

  login_url: string | null;
  note: string | null;
  tags: string[];
  is_pinned: boolean;
  is_archived: boolean;
  status: string;
  priority: string;
};

export default function SecretForm({
  editingItem,
  saving,
  onSubmit,
  onCancel,
}: {
  editingItem: SecretItem | null;
  saving: boolean;
  onSubmit: (payload: SecretPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<SecretFormValues>(initialValues);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const brandInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!editingItem) {
      setForm(initialValues);
      return;
    }

    setForm({
      brand: editingItem.brand || "",
      title: editingItem.title || "",
      username: editingItem.username || "",
      password: editingItem.password || "",
      email: editingItem.email || "",
      phone: editingItem.phone || "",

      secondary_password: editingItem.secondary_password || "",
      pin_code: editingItem.pin_code || "",
      security_question: editingItem.security_question || "",
      security_answer: editingItem.security_answer || "",
      backup_email: editingItem.backup_email || "",
      backup_phone: editingItem.backup_phone || "",
      recovery_codes: editingItem.recovery_codes || "",
      twofa_secret: editingItem.twofa_secret || "",

      login_url: editingItem.login_url || "",
      note: editingItem.note || "",
      tags: editingItem.tags?.join(", ") || "",
      is_pinned: editingItem.is_pinned || false,
      is_archived: editingItem.is_archived || false,
      status: editingItem.status || "active",
      priority: editingItem.priority || "normal",
    });

    setShowAdvanced(
      Boolean(
        editingItem.secondary_password ||
          editingItem.pin_code ||
          editingItem.security_question ||
          editingItem.security_answer ||
          editingItem.backup_email ||
          editingItem.backup_phone ||
          editingItem.recovery_codes ||
          editingItem.twofa_secret
      )
    );

    setTimeout(() => {
      brandInputRef.current?.focus();
    }, 50);
  }, [editingItem]);

  const updateField = (key: keyof SecretFormValues, value: string | boolean) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload: SecretPayload = {
      brand: form.brand.trim(),
      title: form.title.trim(),
      username: form.username.trim() || null,
      password: form.password.trim() || null,
      email: form.email.trim() || null,
      phone: form.phone.trim() || null,

      secondary_password: form.secondary_password.trim() || null,
      pin_code: form.pin_code.trim() || null,
      security_question: form.security_question.trim() || null,
      security_answer: form.security_answer.trim() || null,
      backup_email: form.backup_email.trim() || null,
      backup_phone: form.backup_phone.trim() || null,
      recovery_codes: form.recovery_codes.trim() || null,
      twofa_secret: form.twofa_secret.trim() || null,

      login_url: form.login_url.trim() || null,
      note: form.note.trim() || null,
      tags: form.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      is_pinned: form.is_pinned,
      is_archived: form.is_archived,
      status: form.status,
      priority: form.priority,
    };

    if (!payload.brand || !payload.title) {
      return;
    }

    await onSubmit(payload);
  };

  return (
    <section id="secret-form" className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">
            {editingItem ? "Sửa Secret" : "Thêm Secret"}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Form tối giản để quản lý kho account cá nhân.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setShowAdvanced((prev) => !prev)}
            className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            {showAdvanced ? "Ẩn nâng cao" : "Hiện nâng cao"}
          </button>

          {editingItem && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Hủy sửa
            </button>
          )}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Thông tin chính
          </h3>

          <div className="grid gap-4 md:grid-cols-2">
            <Input
              ref={brandInputRef}
              label="Brand *"
              value={form.brand}
              onChange={(v) => updateField("brand", v)}
            />
            <Input label="Title *" value={form.title} onChange={(v) => updateField("title", v)} />
            <Input label="Username" value={form.username} onChange={(v) => updateField("username", v)} />
            <Input label="Password" value={form.password} onChange={(v) => updateField("password", v)} />
            <Input label="Email" value={form.email} onChange={(v) => updateField("email", v)} />
            <Input label="Phone" value={form.phone} onChange={(v) => updateField("phone", v)} />
            <Input label="Login URL" value={form.login_url} onChange={(v) => updateField("login_url", v)} />
            <Input label="Tags (phân tách bằng dấu phẩy)" value={form.tags} onChange={(v) => updateField("tags", v)} />
          </div>
        </div>

        {showAdvanced && (
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Bảo mật nâng cao
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Secondary Password"
                value={form.secondary_password}
                onChange={(v) => updateField("secondary_password", v)}
              />
              <Input
                label="PIN Code"
                value={form.pin_code}
                onChange={(v) => updateField("pin_code", v)}
              />
              <Input
                label="Security Question"
                value={form.security_question}
                onChange={(v) => updateField("security_question", v)}
              />
              <Input
                label="Security Answer"
                value={form.security_answer}
                onChange={(v) => updateField("security_answer", v)}
              />
              <Input
                label="Backup Email"
                value={form.backup_email}
                onChange={(v) => updateField("backup_email", v)}
              />
              <Input
                label="Backup Phone"
                value={form.backup_phone}
                onChange={(v) => updateField("backup_phone", v)}
              />
              <Input
                label="2FA Secret"
                value={form.twofa_secret}
                onChange={(v) => updateField("twofa_secret", v)}
              />
            </div>

            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium text-zinc-700">
                Recovery Codes
              </label>
              <textarea
                value={form.recovery_codes}
                onChange={(e) => updateField("recovery_codes", e.target.value)}
                rows={5}
                className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
                placeholder="Mỗi code có thể để trên 1 dòng hoặc ngăn cách bằng dấu phẩy..."
              />
            </div>
          </div>
        )}

        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Trạng thái
          </h3>

          <div className="grid gap-4 md:grid-cols-4">
            <Select
              label="Status"
              value={form.status}
              onChange={(v) => updateField("status", v)}
              options={["active", "inactive", "locked", "backup", "deleted"]}
            />
            <Select
              label="Priority"
              value={form.priority}
              onChange={(v) => updateField("priority", v)}
              options={["critical", "important", "normal", "low"]}
            />

            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={(e) => updateField("is_pinned", e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-zinc-700">Pinned</span>
            </label>

            <label className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3">
              <input
                type="checkbox"
                checked={form.is_archived}
                onChange={(e) => updateField("is_archived", e.target.checked)}
                className="h-4 w-4"
              />
              <span className="text-sm font-medium text-zinc-700">Archived</span>
            </label>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-zinc-700">Note</label>
          <textarea
            value={form.note}
            onChange={(e) => updateField("note", e.target.value)}
            rows={5}
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
            placeholder="Ghi chú thêm..."
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
          >
            {saving ? "Đang lưu..." : editingItem ? "Cập nhật" : "Thêm mới"}
          </button>

          {!editingItem && (
            <button
              type="button"
              onClick={() => setForm(initialValues)}
              className="rounded-xl border border-zinc-200 px-5 py-2.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
            >
              Reset
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

const Input = React.forwardRef<HTMLInputElement, {
  label: string;
  value: string;
  onChange: (value: string) => void;
}>(({ label, value, onChange }, ref) => {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
      <input
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
      />
    </div>
  );
});

Input.displayName = "Input";

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-medium text-zinc-700">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );
}