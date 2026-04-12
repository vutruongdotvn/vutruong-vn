"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
type Item = {
  _id: string;
  name: string;
  slug: string;
  thumb_url: string;
};

const CDN = "https://img.ophim.live/uploads/movies";

export default function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadedMap, setLoadedMap] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // ESC close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, onClose]);

  // 🔥 Debounce search
  useEffect(() => {
    if (!keyword.trim()) {
      setResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);

      try {
        const res = await fetch(
          `https://ophim1.com/v1/api/tim-kiem?keyword=${keyword}`
        );
        const json = await res.json();

        setResults(json?.data?.items?.slice(0, 10) || []);
      } catch {
        setResults([]);
      }

      setLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [keyword]);

  const handleSearch = () => {
    if (!keyword.trim()) return;
    onClose();
    router.push(`/watch/search?q=${encodeURIComponent(keyword)}`);
  };

  const handleClear = () => {
    setKeyword("");
    setResults([]);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center">
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-3xl px-4">
        <div className="space-y-6 rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-2xl shadow-2xl p-6 md:p-8 animate-fadeIn">

          {/* HEADER */}
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white/90 flex items-center gap-2">
              <i className="fa-duotone fa-search" /> Tìm kiếm phim
            </h2>

            <button
              onClick={onClose}
              className="text-white/50 hover:text-white transition cursor-pointer hidden"
            >
              <i className="fa-duotone fa-xmark text-lg" />
            </button>
          </div>

          {/* INPUT */}
          <div className="relative">
            <input
              required
              autoFocus
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Nhập tên phim cần tìm"
              className="w-full rounded-2xl bg-white/5 border border-white/10 px-5 py-4 pl-12 text-white placeholder:text-white/40 outline-none focus:border-white/30 focus:bg-white/10 transition"
            />

            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40">
              <i className="fa-duotone fa-magnifying-glass" />
            </div>

            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/40">
              Enter ↵
            </div>
          </div>


          {/* 🔥 REALTIME RESULTS */}
          <div className="grid grid-cols-5 gap-2">

            {/* SKELETON */}
            {loading &&
              Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center animate-pulse">

                  <div className="w-full aspect-[2/3] rounded-md bg-white/10 opacity-70" />

                  <div className="mt-3 mb-4 w-3/4 h-3 rounded bg-white/10" />
                </div>
              ))
            }

            {/* EMPTY */}
            {!loading && results.length === 0 && keyword && (
              <p className="col-span-5 text-sm text-white/40 text-center">
                Không tìm thấy kết quả nào.
              </p>
            )}

            {/* RESULTS */}
            {!loading &&
              results.map((item) => (
                <div
                  key={item._id}
                  onClick={() => {
                    onClose();
                    router.push(`/watch/${item.slug}`);
                  }}
                  className="relative flex flex-col items-center cursor-pointer transition overflow-hidden"
                >
                  <div className="relative w-full aspect-[2/3]">
                    {/* Skeleton */}
                    {!loadedMap[item._id] && (
                      <div className="absolute inset-0 animate-pulse bg-white/10 rounded-lg" />
                    )}

                    <Image
                      src={`${CDN}/${item.thumb_url}`}
                      alt={item.name}
                      fill
                      unoptimized
                      sizes="200px"
                      onLoad={() =>
                        setLoadedMap((prev) => ({ ...prev, [item._id]: true }))
                      }
                      className={`object-cover rounded-lg transition duration-500
                      ${loadedMap[item._id] ? "opacity-100" : "opacity-0"}
                      hover:scale-105`}
                    />
                    <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition rounded-md" />
                  </div>
                  <div className="text-xs font-medium line-clamp-2 text-center mt-3 mb-4 text-white/90 hover:text-white transition">
                    {item.name}
                  </div>
                </div>
              ))}
          </div>

          {/* ACTION */}
          <div className="mt-6 flex items-center justify-end gap-2">

            {/* CLEAR BUTTON */}
            {keyword && (
              <button
                onClick={handleClear}
                className="cursor-pointer px-4 py-3 rounded-xl border border-white/10 text-white/70 hover:text-white hover:bg-white/10 active:scale-95 transition flex items-center gap-2"
              >
                <i className="fa-duotone fa-trash" />
                Xóa
              </button>
            )}

            {/* SEARCH BUTTON */}
            <button
              onClick={handleSearch}
              className="px-5 py-3 rounded-xl bg-white text-black font-medium hover:opacity-90 active:scale-95 transition flex items-center gap-2 cursor-pointer"
            >
              <i className="fa-duotone fa-search" /> Xem tất cả kết quả
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}