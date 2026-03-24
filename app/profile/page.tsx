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
  const [newPassword, setNewPassword] = useState("");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState("");

  const [originalName, setOriginalName] = useState("");
  const [originalAvatar, setOriginalAvatar] = useState("");

  const [avatars, setAvatars] = useState<any[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(true);

  const [toast, setToast] = useState("");

  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const safeAvatar =
    avatar && avatar.trim() !== "" ? avatar : DEFAULT_AVATAR;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // LOAD DATA
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

      // 🔥 LOAD AVATAR LIST
      const { data: avatarList, error } = await supabase
        .from("user_avatars")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      console.log("AVATAR LIST:", avatarList, error);

      setAvatars(avatarList || []);
      setAvatarLoading(false);

      setLoading(false);
    };

    fetchData();
  }, []);

  // CROP
  const onCropComplete = useCallback((_: any, area: any) => {
    setCroppedAreaPixels(area);
  }, []);

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

  // UPLOAD
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

      if (!data.secure_url) {
        showToast("Upload fail ❌");
        return;
      }

      const newUrl = data.secure_url;

      await supabase.from("user_avatars").insert({
        user_id: user.id,
        url: newUrl,
        public_id: data.public_id,
      });

      setAvatar(newUrl);
      showToast("Upload thành công 🎉");

      const { data: avatarList } = await supabase
        .from("user_avatars")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setAvatars(avatarList || []);
      setCropImage(null);
    } catch {
      showToast("Lỗi hệ thống 😢");
    }
  };

  const handleSelectFile = (file: File) => {
    const preview = URL.createObjectURL(file);
    setCropImage(preview);
  };

  const isChanged =
  name !== originalName ||
  avatar !== originalAvatar ||
  newPassword.trim() !== "";

  const handleSave = async () => {
  if (!isChanged || saving) return;

  setSaving(true);

  // update profile (giữ nguyên)
  await supabase
    .from("profiles")
    .update({ name, avatar: safeAvatar })
    .eq("id", user.id);

  // ✅ THÊM ĐOẠN NÀY
  if (newPassword.trim() !== "") {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      console.error(error);
      showToast("Đổi mật khẩu thất bại ❌");
      setSaving(false);
      return;
    }
  }

  setOriginalName(name);
  setOriginalAvatar(avatar);

  // reset password input sau khi lưu
  setNewPassword("");

  setSaving(false);
  showToast("Đã lưu 🎉");
};

  const handleReuse = (url: string) => {
    setAvatar(url);
  };

  const handleDelete = async (item: any) => {
    if (item.url === avatar) {
      setAvatar(DEFAULT_AVATAR);
    }

    await fetch("/api/delete-images", {
      method: "POST",
      body: JSON.stringify({ public_ids: [item.public_id] }),
    });

    await supabase.from("user_avatars").delete().eq("id", item.id);

    setAvatars((prev) => prev.filter((a) => a.id !== item.id));

    showToast("Đã xoá 🗑️");
  };

  // SKELETON
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

  if (!user) {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <GlassCard>
        <p className="text-center text-gray-500">
            <Image
              src={safeAvatar}
              alt="avatar"
              width={44}
              height={44}
              className="rounded-full object-cover mx-auto mb-3"
              onError={() => setAvatar(DEFAULT_AVATAR)}
            />
          Bạn chưa đăng nhập!
        </p>
      </GlassCard>
    </main>
  );
}

  return (
    <main className="min-h-screen flex items-center justify-center">

      {toast && (
        <div className="fixed top-5 right-5 bg-black/80 text-white px-4 py-2 rounded-lg">
          {toast}
        </div>
      )}

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
        <div className="space-y-4 text-center">

          <h1 className="text-xl font-semibold mb-6">Profile</h1>

          {/* AVATAR */}
          <label className="relative w-24 h-24 mx-auto cursor-pointer group block">
            <Image
              src={safeAvatar}
              alt="avatar"
              fill
              className="rounded-full object-cover border"
              onError={() => setAvatar(DEFAULT_AVATAR)}
            />

            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs rounded-full">
              Avatar
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

          {/* NAME */}
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
          />

          <input
  type="password"
  placeholder="Mật khẩu mới"
  value={newPassword}
  onChange={(e) => setNewPassword(e.target.value)}
  className="w-full px-3 py-2 border rounded-lg"
/>

          {/* SAVE */}
          <button
            onClick={handleSave}
            disabled={!isChanged || saving}
            className={`w-full py-2 rounded text-white ${
              !isChanged || saving ? "bg-gray-300" : "bg-blue-500"
            }`}
          >
            {saving ? "Đang lưu..." : "Lưu thay đổi"}
          </button>

          {/* AVATAR LIST */}
          <div className="text-left">
            <p className="text-sm text-gray-500 mb-2">
              Avatar cũ
            </p>

            {avatarLoading ? (
              <div className="grid grid-cols-3 gap-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : avatars.length === 0 ? (
              <p className="text-xs text-gray-400">
                Chưa có avatar nào
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {avatars.map((item) => (
                  <div key={item.id} className="relative group w-33">
                    <img
                      src={item.url}
                      className="w-33 aspect-square rounded-xl object-cover border cursor-pointer"
                      onClick={() => handleReuse(item.url)}
                    />

                    <div className="absolute w-auto rounded-xl inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-sm gap-2">
                      <button className="cursor-pointer hover:text-sky-400 font-normal hover:font-bold" onClick={() => handleReuse(item.url)}>
                        Sử dụng
                      </button>
                      <button className="cursor-pointer hover:text-red-400 font-normal hover:font-bold" onClick={() => handleDelete(item)}>
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </GlassCard>
    </main>
  );
}