"use client";

import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";

export default function IntroWidget() {
  const { role } = useUser();

  const [bio, setBio] = useState("");
  const [originalBio, setOriginalBio] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = role === "admin";
  const hasChanged = bio !== originalBio;

  const divRef = useRef<HTMLDivElement | null>(null);

  const [loadingProfile, setLoadingProfile] = useState(true);

  // 🔥 FETCH ADMIN PROFILE
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

  // 🔥 CHỈ SYNC DOM KHI ENTER EDIT MODE
  useEffect(() => {
    if (editing && divRef.current) {
      if (divRef.current.innerText !== bio) {
        divRef.current.innerText = bio || "";
      }
    }
  }, [editing, bio]);

  // 🔥 REALTIME (KHÔNG PHÁ EDIT MODE)
  useEffect(() => {
    if (!profileId) return;

    const channel = supabase
      .channel("profile-bio")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${profileId}`,
        },
        (payload) => {
          if (editing || loadingProfile) return;

          const value = payload.new.bio || "";
          setBio(value);
          setOriginalBio(value);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId, editing]);

  // 🔥 SAVE
  const handleSave = async () => {
    if (!profileId || !hasChanged || loading) return;

    setLoading(true);

    const clean = bio
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s+$/gm, "")
      .trim();

    const { error } = await supabase
      .from("profiles")
      .update({ bio: clean })
      .eq("id", profileId);

    setLoading(false);

    if (error) {
      console.error("Update bio error:", error);
      return;
    }

    setEditing(false);
    setOriginalBio(clean);
  };

  // 🔥 CANCEL
  const handleCancel = () => {
    if (hasChanged) {
      const ok = confirm("Bạn có thay đổi chưa lưu. Huỷ bỏ?");
      if (!ok) return;
    }

    setBio(originalBio);

    if (divRef.current) {
      divRef.current.innerText = originalBio;
    }

    setEditing(false);
  };

  return (
    <div className="rounded-0 sm:rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.075)] p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Giới thiệu</h3>

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
          <div className="space-y-2 sm:space-y-4 animate-pulse">
            <div className="h-[1rem] bg-gray-100 rounded-full w-3/4"></div>
          </div>
        ) : (
          <p className="text-sm sm:text-base/6 text-gray-800 dark:text-neutral-400 whitespace-pre-line">
            {bio || "..."}
          </p>
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
            className="w-full text-[.9375rem] sm:text-base/6 outline-none whitespace-pre-wrap break-words empty:before:content-[attr(data-placeholder)] empty:before:text-neutral-400"
            onInput={(e) => {
              setBio(e.currentTarget.innerText);
            }}
            onBlur={(e) => {
              setBio(e.currentTarget.innerText);
            }}
            onPaste={(e) => {
              e.preventDefault();
              const text = e.clipboardData.getData("text/plain");
              document.execCommand("insertText", false, text);
            }}
          />

          <div className="flex justify-end gap-1 mt-4 pt-4 border-t border-black/5">
            <button
              onClick={handleCancel}
              className="text-xs px-5 py-2 rounded-full bg-gray-50 hover:bg-gray-100 active:bg-gray-200 cursor-pointer active:scale-95"
            >
              Huỷ
            </button>

            <button
              onClick={handleSave}
              disabled={!hasChanged || loading}
              className="text-xs px-5 py-2 rounded-full bg-black/80 hover:bg-black text-white cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu" : "Lưu thay đổi"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}