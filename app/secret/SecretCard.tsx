"use client";

import SecretField from "./SecretField";

export type SecretItem = {
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

export default function SecretCard({
  item,
  onEdit,
  onDelete,
  deleting,
}: {
  item: SecretItem;
  onEdit: (item: SecretItem) => void;
  onDelete: (item: SecretItem) => void;
  deleting: boolean;
}) {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-semibold text-zinc-900">{item.title}</h2>

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

        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
            {item.status}
          </span>
          <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
            {item.priority}
          </span>

          <button
            type="button"
            onClick={() => onEdit(item)}
            className="rounded-xl border border-zinc-200 px-3 py-1.5 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
          >
            Sửa
          </button>

          <button
            type="button"
            onClick={() => onDelete(item)}
            disabled={deleting}
            className="rounded-xl border border-red-200 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            {deleting ? "Đang xóa..." : "Xóa"}
          </button>
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
  );
}