"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";

export default function IntroWidget() {
  const { user, role } = useUser();

  const [bio, setBio] = useState("");
  const [profileId, setProfileId] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = role === "admin";

  // 🔥 FETCH PROFILE ĐÚNG USER
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, bio")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Fetch bio error:", error);
        return;
      }

      setBio(data?.bio || "");
      setProfileId(data?.id);
    };

    fetchProfile();
  }, [user]);

  // 🔥 REALTIME
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
          setBio(payload.new.bio);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  // 🔥 SAVE
  const handleSave = async () => {
    if (!profileId) return;

    setLoading(true);

    const { error } = await supabase
      .from("profiles")
      .update({ bio })
      .eq("id", profileId);

    setLoading(false);

    if (error) {
      console.error("Update bio error:", error);
      return;
    }

    setEditing(false);
  };

  return (
    <div className="rounded-0 sm:rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.075)] p-3 sm:p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold">Giới thiệu</h3>

        {isAdmin && !editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-neutral-500 hover:text-neutral-800 cursor-pointer active:scale-95"
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      {/* VIEW */}
      {!editing && (
        <p className="text-sm text-neutral-600 dark:text-neutral-400 whitespace-pre-line">
          {bio || "..."}
        </p>
      )}

      {/* EDIT */}
      {editing && (
        <div className="space-y-2">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full text-sm p-3 rounded-lg border"
          />

          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="text-xs px-5 py-2 rounded-lg bg-black text-white cursor-pointer active:scale-95"
            >
              {loading ? "Đang lưu" : "Lưu thay đổi"}
            </button>

            <button
              onClick={() => setEditing(false)}
              className="text-xs px-5 py-2 rounded-lg bg-gray-50 border border-gray-300 cursor-pointer active:scale-95"
            >
              Huỷ
            </button>
          </div>
        </div>
      )}
    </div>
  );
}