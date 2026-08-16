"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import {
  normalizePostContent,
  getPostParagraphs,
  parsePostInline,
} from "@/lib/utils";

export default function IntroWidget() {
  const { role } = useUser();

  const [bio, setBio] = useState("");
  const [originalBio, setOriginalBio] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);

  const isAdmin = role === "admin";
  const hasChanged = bio !== originalBio;

  const divRef = useRef<HTMLDivElement | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);

  // ⚙️ TỐI ƯU LOGIC RENDER (Không dùng JS Truncate nữa)
  const MAX_LENGTH = 110;

  const normalizedBio = useMemo(() => normalizePostContent(bio), [bio]);
  const fullParagraphs = useMemo(() => getPostParagraphs(normalizedBio), [normalizedBio]);

  // Chỉ dùng MAX_LENGTH làm mốc để quyết định "có cho phép thu gọn/mở rộng không"
  const isLong = normalizedBio.length > MAX_LENGTH;
  const isCollapsed = isLong && !isExpanded;

  const renderInlineParts = (text: string) => {
    const inlineParts = parsePostInline(text);

    return inlineParts.map((part, partIndex) => {
      if (part.type === "bold") {
        return <strong key={partIndex} className="font-semibold text-gray-900">{part.value}</strong>;
      }
      if (part.type === "link") {
        return (
          <Link
            key={partIndex}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sky-700 font-medium hover:text-sky-900 break-words"
            onClick={(e) => e.stopPropagation()}
          >
            {part.value}
          </Link>
        );
      }
      if (part.type === "hashtag") {
        const tagName = part.value.replace(/^#/, "").trim().toLowerCase();
        return (
          <Link
            title={`Xem hashtag #${encodeURIComponent(tagName)}`}
            key={partIndex}
            href={`/blog/tag/${encodeURIComponent(tagName)}`}
            className="text-sky-700 font-medium hover:underline active:scale-95 inline-flex break-words"
            onClick={(e) => e.stopPropagation()}
          >
            {part.value}
          </Link>
        );
      }
      return <span key={partIndex}>{part.value}</span>;
    });
  };

  // 🔥 FETCH ADMIN PROFILE (Giữ nguyên)
  useEffect(() => {
    const fetchProfile = async () => {
      setLoadingProfile(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, bio")
        .eq("email", "admin@vutruong.vn")
        .single();

      if (error) {
        console.error("Fetch bio error:", error);
        setLoadingProfile(false);
        return;
      }
      const value = data?.bio || "";
      setBio(value);
      setOriginalBio(value);
      setProfileId(data?.id);
      setLoadingProfile(false);
    };
    fetchProfile();
  }, []);

  // 🔥 ĐỒNG BỘ DOM KHI EDIT (Giữ nguyên)
  useEffect(() => {
    if (editing && divRef.current && divRef.current.innerText !== bio) {
      divRef.current.innerText = bio || "";
    }
  }, [editing, bio]);

  // 🔥 REALTIME (Giữ nguyên)
  useEffect(() => {
    if (!profileId) return;
    const channel = supabase
      .channel("profile-bio")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "profiles", filter: `id=eq.${profileId}` },
        (payload) => {
          if (editing || loadingProfile) return;
          const value = payload.new.bio || "";
          setBio(value);
          setOriginalBio(value);
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profileId, editing, loadingProfile]);

  // 🔥 SAVE & CANCEL (Giữ nguyên)
  const handleSave = async () => {
    if (!profileId || !hasChanged || loading) return;
    setLoading(true);
    const clean = bio.replace(/\n{3,}/g, "\n\n").replace(/\s+$/gm, "").trim();
    const { error } = await supabase.from("profiles").update({ bio: clean }).eq("id", profileId);
    setLoading(false);
    if (error) return console.error("Update bio error:", error);
    setEditing(false);
    setOriginalBio(clean);
  };

  const handleCancel = () => {
    if (hasChanged && !confirm("Bạn có thay đổi chưa lưu. Huỷ bỏ?")) return;
    setBio(originalBio);
    if (divRef.current) divRef.current.innerText = originalBio;
    setEditing(false);
  };

  return (
    <div className="rounded-0 sm:rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.075)] p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[.9375rem] sm:text-base font-semibold">Giới thiệu</h3>
        {isAdmin && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer active:scale-95"
          >
            <i className="fadt fa-pen" />
          </button>
        )}
      </div>

      {/* VIEW */}
      {!editing && (
        loadingProfile ? (
          <div className="space-y-1.5 sm:space-y-3 animate-pulse">
            <div className="h-[1rem] bg-gray-100 rounded-full w-full"></div>
            <div className="h-[1rem] bg-gray-100 rounded-full w-3/4"></div>
            <div className="h-[1rem] bg-gray-100 rounded-full w-1/3"></div>
          </div>
        ) : (
          <div className="text-sm sm:text-base/6 text-gray-800 space-y-3">
            {isCollapsed ? (
              // BẢN RÚT GỌN (CSS TỰ ĐỘNG CẮT Ở DÒNG 3)
              <div
                role="button"
                tabIndex={0}
                onClick={() => setIsExpanded(true)}
                onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(true)}
                className="cursor-pointer transition-opacity hover:opacity-75 outline-none rounded-md"
                title="Nhấn để xem thêm"
              >
                <div className="whitespace-pre-line break-words line-clamp-3">
                  {/* Bơm thẳng bio vào, CSS sẽ tự cắt rất đẹp */}
                  {renderInlineParts(normalizedBio)}
                </div>
              </div>
            ) : (
              // BẢN MỞ RỘNG
              <div className="space-y-2">
                {fullParagraphs.length > 0 ? (
                  fullParagraphs.map((paragraph, index) => (
                    <p key={index} className="whitespace-pre-line break-words">
                      {renderInlineParts(paragraph)}
                    </p>
                  ))
                ) : (
                  <p>...</p>
                )}

                {/*isLong && (
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="mt-1 align-baseline font-medium text-gray-500 hover:text-black cursor-pointer text-xs transition"
                  >
                    <i className="fa-duotone fa-angle-up mr-1" /> Thu gọn
                  </button>
                )}
                */}
              </div>
            )}
            <div className="border-t border-slate-200 pt-3 space-y-1 lg:space-y-3 text-sm sm:text-base/6 text-gray-800">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center xt-sm sm:text-lg bg-slate-100 text-center rounded-full size-8"><i className="far fa-blog" /></span> <b>Trang</b> <span>•</span> <span>Blog cá nhân</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center xt-sm sm:text-lg bg-slate-100 text-center rounded-full size-8"><i className="far fa-clock" /></span> <b>Tham gia</b> <span>•</span> <span>Tháng 7 năm 2017</span>
              </div>
            </div>
          </div>

        )
      )}

      {/* EDIT */}
      {editing && (
        <div className="space-y-2">
          <div
            ref={divRef}
            contentEditable={isAdmin}
            suppressContentEditableWarning
            role="textbox"
            spellCheck={false}
            data-placeholder="Nhập giới thiệu..."
            className="w-full text-sm sm:text-base/6 outline-none whitespace-pre-wrap break-words empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400"
            onInput={(e) => setBio(e.currentTarget.innerText)}
            onBlur={(e) => setBio(e.currentTarget.innerText)}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
            }}
          />

          <div className="flex justify-end gap-1 mt-4 pt-4 border-t border-black/5">
            <button
              onClick={handleCancel}
              className="text-xs px-5 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 cursor-pointer active:scale-95"
            >
              Huỷ
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanged || loading}
              className="text-xs px-5 py-2 rounded-lg bg-black/80 hover:bg-black text-white cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu" : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}