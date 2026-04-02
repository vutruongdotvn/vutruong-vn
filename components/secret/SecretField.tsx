"use client";
import { useState } from "react";
import CopyButton from "./CopyButton";
export default function SecretField({
  label, value, hidden=false
}: { label: string; value?: string|null; hidden?: boolean }) {
  const [revealed, setRevealed] = useState(false);
  if (!value) return null;
  const display = hidden && !revealed ? "••••••••" : value;
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
      <div className="flex justify-between">
        <p className="text-[11px] font-medium uppercase text-zinc-500">{label}</p>
        <div className="flex gap-2">
          {hidden && (
            <button onClick={() => setRevealed(r => !r)}
                    className="px-2 py-1 border border-zinc-200 text-xs text-zinc-600 hover:bg-zinc-100">
              {revealed ? "Ẩn" : "Hiện"}
            </button>
          )}
          <CopyButton value={value} />
        </div>
      </div>
      <p className="mt-2 text-sm text-zinc-800 whitespace-pre-wrap">{display}</p>
    </div>
  );
}
