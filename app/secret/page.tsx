"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type AuthState = "loading" | "unauthorized" | "forbidden" | "authorized";

type SecretItem = {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;

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
  status: string;
  priority: string;

  is_pinned: boolean;
  is_archived: boolean;

  last_used_at: string | null;
  last_viewed_at: string | null;
};

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition"
    >
      {copied ? "Đã copy" : "Copy"}
    </button>
  );
}

function SecretField({
  label,
  value,
  hidden = false,
}: {
  label: string;
  value?: string | null;
  hidden?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!value) return null;

  const displayValue = hidden && !revealed ? "••••••••••••••••" : value;

  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
          {label}
        </p>

        <div className="flex items-center gap-2">
          {hidden && (
            <button
              type="button"
              onClick={() => setRevealed((prev) => !prev)}
              className="rounded-lg border border-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-100 transition"
            >
              {revealed ? "Ẩn" : "Hiện"}
            </button>
          )}

          <CopyButton value={value} />
        </div>
      </div>

      <p className="mt-2 whitespace-pre-wrap break-words text-sm text-zinc-800">
        {displayValue}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-5">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        {title}
      </h3>
      <div className="grid gap-3 md:grid-cols-2">{children}</div>
    </section>
  );
}

export default function SecretPage() {
  const router = useRouter();

  const [authState, setAuthState] = useState<AuthState>("loading");
  const [items, setItems] = useState<SecretItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

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

      const { data, error: fetchError } = await supabase
        .from("secret")
        .select("*")
        .order("is_pinned", { ascending: false })
        .order("updated_at", { ascending: false });

      if (fetchError) {
        setErrorMessage(fetchError.message || "Không thể tải dữ liệu secret.");
        setLoadingData(false);
        return;
      }

      setItems((data as SecretItem[]) || []);
      setLoadingData(false);
    };

    init();
  }, [router]);

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

      {loadingData ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Đang tải dữ liệu...</p>
        </div>
      ) : errorMessage ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <h2 className="text-lg font-semibold text-red-600">Lỗi tải dữ liệu</h2>
          <p className="mt-2 text-sm text-zinc-700">{errorMessage}</p>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-zinc-500">Chưa có dữ liệu trong bảng secret.</p>
        </div>
      ) : (
        <div className="grid gap-5">
          {items.map((item) => (
            <article
              key={item.id}
              className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-zinc-900">
                      {item.title}
                    </h2>

                    {item.is_pinned && (
                      <span className="rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-medium text-yellow-700">
                        Pinned
                      </span>
                    )}

                    {item.is_archived && (
                      <span className="rounded-full bg-zinc-200 px-2.5 py-1 text-xs font-medium text-zinc-700">
                        Archived
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-sm text-zinc-500">{item.brand}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                    {item.status}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                    {item.priority}
                  </span>
                </div>
              </div>

              {item.tags?.length > 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <Section title="Đăng nhập">
                <SecretField label="Username" value={item.username} />
                <SecretField label="Password" value={item.password} hidden />
                <SecretField label="Email" value={item.email} />
                <SecretField label="Phone" value={item.phone} />
                <SecretField label="Secondary Password" value={item.secondary_password} hidden />
                <SecretField label="PIN Code" value={item.pin_code} hidden />
                <SecretField label="Login URL" value={item.login_url} />
              </Section>

              <Section title="Khôi phục & bảo mật">
                <SecretField label="Security Question" value={item.security_question} />
                <SecretField label="Security Answer" value={item.security_answer} hidden />
                <SecretField label="Backup Email" value={item.backup_email} />
                <SecretField label="Backup Phone" value={item.backup_phone} />
                <SecretField label="Recovery Codes" value={item.recovery_codes} hidden />
                <SecretField label="2FA Secret" value={item.twofa_secret} hidden />
              </Section>

              <Section title="Ghi chú & khác">
                <SecretField label="Note" value={item.note} />
              </Section>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}