"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import GlassCard from "@/components/home/GlassCard";
import { createClient } from "@supabase/supabase-js";
import Cropper from "react-easy-crop";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const DEFAULT_AVATAR = "/images/default.jpg";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const [originalName, setOriginalName] = useState("");
  const [originalAvatar, setOriginalAvatar] = useState("");

  const [avatars, setAvatars] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState("");

  // crop
  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  // 🔥 SAFE AVATAR (KEY FIX)
  const safeAvatar =
    avatar && avatar.trim() !== "" ? avatar : DEFAULT_AVATAR;

  // toast helper
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // load data
  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      setUser(user);

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      const initialAvatar =
        profile?.avatar && profile.avatar !== ""
          ? profile.avatar
          : DEFAULT_AVATAR;

      setName(profile?.name || "");
      setAvatar(initialAvatar);
      setOriginalName(profile?.name || "");
      setOriginalAvatar(initialAvatar);

      const { data: avatarList } = await supabase
        .from("user_avatars")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setAvatars(avatarList || []);

      setLoading(false);
    };

    fetchData();
  }, []);

  // crop complete
  const onCropComplete = useCallback((_: any, area: any) => {
    setCroppedAreaPixels(area);
  }, []);

  // crop -> blob
  const getCroppedImage = async () => {
    const image = new window.Image();
    image.src = cropImage!;
    await new Promise((resolve) => (image.onload = resolve));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;

    canvas.width = croppedAreaPixels.width;
    canvas.height = croppedAreaPixels.height;

    ctx.drawImage(
      image,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height
    );

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), "image/jpeg");
    });
  };

  // upload avatar
  const handleCropSave = async () => {
    try {
      const blob = await getCroppedImage();

      const formData = new FormData();
      formData.append("file", blob);
      formData.append("upload_preset", "unsigned_upload");

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: "POST", body: formData }
      );

      const data = await res.json();
      const newUrl = data.secure_url;

      setAvatar(newUrl);

      await supabase.from("user_avatars").insert({
        user_id: user.id,
        url: newUrl,
        public_id: data.public_id,
      });

      showToast("Upload thành công 🎉");

      const { data: avatarList } = await supabase
        .from("user_avatars")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setAvatars(avatarList || []);

      setCropImage(null);
    } catch {
      showToast("Upload lỗi 😢");
    }
  };

  const handleSelectFile = (file: File) => {
    const preview = URL.createObjectURL(file);
    setCropImage(preview);
  };

  const isChanged =
    name !== originalName || avatar !== originalAvatar;

  const handleSave = async () => {
    if (!isChanged || saving) return;

    setSaving(true);

    await supabase
      .from("profiles")
      .update({
        name,
        avatar: safeAvatar,
      })
      .eq("id", user.id);

    setOriginalName(name);
    setOriginalAvatar(avatar);

    setSaving(false);
    showToast("Đã lưu 🎉");
  };

  const handleReuse = (url: string) => {
    setAvatar(url);
  };

  const handleDelete = async (item: any) => {
    if (item.url === avatar) {
      setAvatar(DEFAULT_AVATAR);

      await supabase
        .from("profiles")
        .update({ avatar: DEFAULT_AVATAR })
        .eq("id", user.id);
    }

    await fetch("/api/delete-images", {
      method: "POST",
      body: JSON.stringify({
        public_ids: [item.public_id],
      }),
    });

    await supabase
      .from("user_avatars")
      .delete()
      .eq("id", item.id);

    setAvatars((prev) => prev.filter((a) => a.id !== item.id));

    showToast("Đã xoá 🗑️");
  };

  // skeleton
  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <GlassCard>
          <div className="space-y-4 animate-pulse w-[260px]">
            <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto" />
            <div className="h-8 bg-gray-300 rounded" />
            <div className="h-10 bg-gray-300 rounded" />
          </div>
        </GlassCard>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center">

      {/* toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-black/80 text-white px-4 py-2 rounded-lg">
          {toast}
        </div>
      )}

      {/* crop modal */}
      {cropImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded-xl w-[320px] space-y-4">
            <div className="relative w-full h-[250px]">
              <Cropper
                image={cropImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />

            <div className="flex gap-2">
              <button
                onClick={() => setCropImage(null)}
                className="flex-1 bg-gray-200 py-2 rounded"
              >
                Huỷ
              </button>
              <button
                onClick={handleCropSave}
                className="flex-1 bg-blue-500 text-white py-2 rounded"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <GlassCard>
        <div className="space-y-6 text-center">

          <h1 className="text-xl font-semibold">Profile</h1>

          {/* 🔥 AVATAR + UPLOAD FIX */}
          <label className="relative w-24 h-24 mx-auto cursor-pointer group block">
            <div className="relative w-full h-full">
              <Image
                key={safeAvatar}
                src={safeAvatar}
                alt="avatar"
                fill
                onError={() => setAvatar(DEFAULT_AVATAR)}
                className="rounded-full object-cover border"
              />
            </div>

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs rounded-full">
              Đổi ảnh
            </div>

            <input
              type="file"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleSelectFile(file);
              }}
            />
          </label>

          {/* name */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />

          {/* save */}
          <button
            onClick={handleSave}
            disabled={!isChanged || saving}
            className={`w-full py-2 rounded text-white ${
              !isChanged || saving
                ? "bg-gray-300"
                : "bg-blue-500"
            }`}
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>

          {/* history */}
          <div className="text-left">
            <p className="text-sm text-gray-500 mb-2">
              Avatar đã dùng
            </p>

            <div className="grid grid-cols-3 gap-3">
              {avatars.map((item) => (
                <div key={item.id} className="relative group">
                  <div
                    className={`relative w-full aspect-square rounded-lg overflow-hidden border cursor-pointer ${
                      item.url === avatar
                        ? "ring-2 ring-blue-500"
                        : ""
                    }`}
                    onClick={() => handleReuse(item.url)}
                  >
                    <Image
                      src={item.url}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-xs gap-1">
                    <button onClick={() => handleReuse(item.url)}>
                      Dùng
                    </button>
                    <button onClick={() => handleDelete(item)}>
                      Xoá
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </GlassCard>
    </main>
  );
}