"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import SecretCard, { type SecretItem } from "./SecretCard";
import SecretForm, { type SecretPayload } from "./SecretForm";

type AuthState = "loading" | "unauthorized" | "forbidden" | "authorized";
type FilterMode = "all" | "pinned" | "active" | "archived";

export default function SecretPage() {
  const router = useRouter();

  const [authState, setAuthState] = useState<AuthState>("loading");
  const [items, setItems] = useState<SecretItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [editingItem, setEditingItem] = useState<SecretItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState<FilterMode>("all");

  const loadSecrets = async () => {
    setLoadingData(true);
    setErrorMessage("");

    const { data, error } = await supabase
      .from("secret")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("updated_at", { ascending: false });

    if (error) {
      setErrorMessage(error.message || "Không thể tải dữ liệu secret.");
      setLoadingData(false);
      return;
    }

    setItems((data as SecretItem[]) || []);
    setLoadingData(false);
  };

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        setAuthState("unauthorized");
        router.replace("/login");
        return;
      }

      const isAdmin = user.id === process.env.NEXT_PUBLIC_ADMIN_USER_ID;

      if (!isAdmin) {
        setAuthState("forbidden");
        setLoadingData(false);
        return;
      }

      setAuthState("authorized");
      await loadSecrets();
    };

    init();
  }, [router]);

  const handleSave = async (payload: SecretPayload) => {
    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Phiên đăng nhập không hợp lệ.");
      setSaving(false);
      return;
    }

    if (editingItem) {
      const { error } = await supabase
        .from("secret")
        .update({
          ...payload,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingItem.id);

      if (error) {
        alert(error.message || "Không thể cập nhật secret.");
        setSaving(false);
        return;
      }

      setEditingItem(null);
      await loadSecrets();
      setSaving(false);
      return;
    }

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `secret-${Date.now()}`;

    const { error } = await supabase.from("secret").insert({
      id,
      user_id: user.id,
      ...payload,
    });

    if (error) {
      alert(error.message || "Không thể thêm secret.");
      setSaving(false);
      return;
    }

    await loadSecrets();
    setSaving(false);
  };

  const handleDelete = async (item: SecretItem) => {
    const confirmed = window.confirm(`Xóa "${item.title}"?`);
    if (!confirmed) return;

    setDeletingId(item.id);

    const { error } = await supabase.from("secret").delete().eq("id", item.id);

    if (error) {
      alert(error.message || "Không thể xóa secret.");
      setDeletingId(null);
      return;
    }

    if (editingItem?.id === item.id) {
      setEditingItem(null);
    }

    await loadSecrets();
    setDeletingId(null);
  };

  const filteredItems = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    return items.filter((item) => {
      const matchesFilter =
        filterMode === "all"
          ? true
          : filterMode === "pinned"
          ? item.is_pinned
          : filterMode === "active"
          ? item.status === "active" && !item.is_archived
          : filterMode === "archived"
          ? item.is_archived
          : true;

      if (!matchesFilter) return false;

      if (!keyword) return true;

      const haystack = [
        item.title,
        item.brand,
        item.username,
        item.email,
        item.phone,
        item.note,
        ...(item.tags || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [items, search, filterMode]);

  if (authState === "loading") {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <p className="text-sm text-zinc-500">Đang kiểm tra quyền truy cập...</p>
      </main>
    );
  }

  if (authState === "forbidden") {
    return (
      <main className="max-w-3xl mx-auto px-4 py-10">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h1 className="text-xl font-semibold text-red-600">Truy cập bị từ chối</h1>
          <p className="mt-2 text-sm text-zinc-700">
            Tài khoản này không có quyền truy cập trang /secret.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Secret Vault</h1>
        <p className="mt-2 text-sm text-zinc-500">
          Kho lưu thông tin tài khoản cá nhân admin-only.
        </p>
      </div>

      <SecretForm
        editingItem={editingItem}
        saving={saving}
        onSubmit={handleSave}
        onCancel={() => setEditingItem(null)}
      />

      <section className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
        <div className="grid gap-4 md:grid-cols-[1fr_auto]">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo title, brand, username, email, note, tag..."
            className="w-full rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none focus:border-zinc-400"
          />

          <div className="flex flex-wrap gap-2">
            <FilterButton
              label="All"
              active={filterMode === "all"}
              onClick={() => setFilterMode("all")}
            />
            <FilterButton
              label="Pinned"
              active={filterMode === "pinned"}
              onClick={() => setFilterMode("pinned")}
            />
            <FilterButton
              label="Active"
              active={filterMode === "active"}
              onClick={() => setFilterMode("active")}
            />
            <FilterButton
              label="Archived"
              active={filterMode === "archived"}
              onClick={() => setFilterMode("archived")}
            />
          </div>
        </div>

        <p className="mt-3 text-sm text-zinc-500">
          Hiển thị <span className="font-medium text-zinc-800">{filteredItems.length}</span> /{" "}
          <span className="font-medium text-zinc-800">{items.length}</span> secret
        </p>
      </section>

      {loadingData ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Đang tải dữ liệu...</p>
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-600">Lỗi tải dữ liệu</h2>
          <p className="mt-2 text-sm text-zinc-700">{errorMessage}</p>
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">
            Không có secret nào khớp với bộ lọc hiện tại.
          </p>
        </div>
      ) : (
        <div className="grid gap-5">
          {filteredItems.map((item) => (
            <SecretCard
              key={item.id}
              item={item}
              onEdit={setEditingItem}
              onDelete={handleDelete}
              deleting={deletingId === item.id}
            />
          ))}
        </div>
      )}
    </main>
  );
}

function FilterButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
        active
          ? "bg-zinc-900 text-white"
          : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
      }`}
    >
      {label}
    </button>
  );
}