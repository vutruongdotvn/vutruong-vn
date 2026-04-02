"use client";

import { useState } from "react";

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

export default function SecretField({
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

  const displayValue = hidden && !revealed ? "••••••••" : value;

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