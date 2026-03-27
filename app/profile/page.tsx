"use client";

import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";
import FloatingSymbols from "@/components/ui/FloatingSymbols";
import { createClient } from "@supabase/supabase-js";
import Cropper from "react-easy-crop";
import { useToast } from "@/hooks/useToast";

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

  const [cropImage, setCropImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const { showToast } = useToast();

  const safeAvatar =
    avatar && avatar.trim() !== "" ? avatar : DEFAULT_AVATAR;

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
        showToast("Tải avatar lên thất bại", "error");
        return;
      }

      const newUrl = data.secure_url;

      await supabase.from("user_avatars").insert({
        user_id: user.id,
        url: newUrl,
        public_id: data.public_id,
      });

      setAvatar(newUrl);
      showToast("Tải avatar lên thành công", "success");

      const { data: avatarList } = await supabase
        .from("user_avatars")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      setAvatars(avatarList || []);
      setCropImage(null);
    } catch {
      showToast("Có lỗi xảy ra khi tải avatar", "error");
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

    if (!name.trim() && newPassword.trim() === "" && avatar === originalAvatar) {
      showToast("Không có thay đổi nào để lưu", "warning");
      return;
    }

    if (newPassword.trim() !== "" && newPassword.trim().length < 6) {
      showToast("Mật khẩu mới phải có ít nhất 6 ký tự", "warning");
      return;
    }

    setSaving(true);

    await supabase
      .from("profiles")
      .update({ name, avatar: safeAvatar })
      .eq("id", user.id);

    if (newPassword.trim() !== "") {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        console.error(error);
        showToast("Đổi mật khẩu thất bại", "error");
        setSaving(false);
        return;
      }
    }

    setOriginalName(name);
    setOriginalAvatar(avatar);
    setNewPassword("");

    setSaving(false);
    showToast("Đã lưu thay đổi", "success");
  };

  const handleReuse = (url: string) => {
    setAvatar(url);
    showToast("Đã chọn lại avatar cũ", "success");
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

    showToast("Đã xoá avatar", "success");
  };

  if (loading) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-16">
        <FloatingSymbols />
        <PremiumGlassCard
          className="max-w-5xl"
          contentClassName="p-8 sm:p-10"
        >
          <div className="animate-pulse">
            <div className="mx-auto mb-8 h-10 w-40 rounded-full bg-black/10" />
            <div className="mx-auto mb-4 h-10 w-56 rounded-xl bg-black/10" />
            <div className="mx-auto mb-10 h-5 w-80 rounded-xl bg-black/10" />

            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
              <div className="rounded-[32px] border border-black/5 bg-white/55 p-6">
                <div className="mx-auto mb-6 h-32 w-32 rounded-full bg-black/10" />
                <div className="space-y-4">
                  <div className="h-5 w-24 rounded bg-black/10" />
                  <div className="h-12 rounded-xl bg-black/10" />
                  <div className="h-5 w-28 rounded bg-black/10" />
                  <div className="h-12 rounded-xl bg-black/10" />
                  <div className="h-12 rounded-full bg-black/10" />
                </div>
              </div>

              <div className="rounded-[32px] border border-black/5 bg-white/55 p-6">
                <div className="mb-4 h-5 w-28 rounded bg-black/10" />
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-3xl bg-black/10"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </PremiumGlassCard>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-16">
        <FloatingSymbols />
        <PremiumGlassCard
          className="max-w-md"
          contentClassName="p-10 sm:p-12 text-center"
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <Image
                src={safeAvatar}
                alt="avatar"
                width={72}
                height={72}
                className="rounded-full object-cover border border-white/60 shadow-sm"
                onError={() => setAvatar(DEFAULT_AVATAR)}
              />
            </div>

            <div>
              <p className="text-lg font-semibold text-neutral-900">
                Hello 👋
              </p>
              <p className="mt-2 text-sm text-neutral-500">
                Đăng nhập để chỉnh sửa thông tin cá nhân của bạn.
              </p>
            </div>
          </div>
        </PremiumGlassCard>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-16">
      <FloatingSymbols />

      {cropImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-sm rounded-3xl border border-white/20 bg-white/95 p-5 shadow-2xl backdrop-blur-xl space-y-4">
            <div className="relative h-[280px] w-full overflow-hidden rounded-xl bg-black/5">
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
              className="w-full accent-neutral-900"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setCropImage(null)}
                className="flex-1 rounded-full border border-black/10 bg-black/5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-black/10"
              >
                Huỷ
              </button>
              <button
                onClick={handleCropSave}
                className="flex-1 rounded-full bg-neutral-900 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}

      <PremiumGlassCard
        className="max-w-6xl"
        contentClassName="p-6 sm:p-8 lg:p-10 xl:p-12"
      >
        <div className="space-y-10">
          <div className="text-center">
            <div className="mb-5 flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-sky-300 bg-sky-100 px-4 py-1.5 text-xs font-medium text-neutral-600 backdrop-blur">
                <i className="fa-duotone fa-user-gear text-sky-500" />
                Hồ sơ cá nhân
              </span>
            </div>

            <h1 className="text-4xl font-semibold tracking-tight text-neutral-900 sm:text-5xl">
              Profile
            </h1>
            <p className="mt-3 text-sm leading-7 text-neutral-500 md:text-base">
              Cập nhật tên, ảnh đại diện và mật khẩu.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
            <section className="relative overflow-hidden rounded-[34px] border border-black/5 bg-white/60 p-6 shadow-[0_16px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:p-8">
              <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-sky-100/35 to-transparent pointer-events-none" />
              <div className="absolute -bottom-10 left-1/2 h-32 w-32 -translate-x-1/2 rounded-full bg-sky-100/25 blur-3xl pointer-events-none" />

              <div className="relative mb-8 text-center">
                <label className="relative mx-auto block h-36 w-36 cursor-pointer group/avatar-main">
                  <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-sky-200/50 via-white/0 to-purple-200/40 blur-2xl opacity-90" />

                  <Image
                    src={safeAvatar}
                    alt="avatar"
                    fill
                    className="relative rounded-full object-cover border border-white/80 shadow-[0_14px_50px_rgba(0,0,0,0.18)]"
                    onError={() => setAvatar(DEFAULT_AVATAR)}
                  />

                  <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/35 text-sm font-medium text-white opacity-0 transition group-hover/avatar-main:opacity-100">
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

                <p className="mt-5 text-sm text-neutral-500">
                  Nhấn vào ảnh để tải avatar mới
                </p>
              </div>

              <div className="relative space-y-5">
                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <i className="fa-duotone fa-signature text-neutral-400 text-sm" />
                    <label className="text-sm font-medium text-neutral-700">
                      Tên hiển thị
                    </label>
                  </div>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3.5 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-black/20 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,0,0,0.03)]"
                  />
                </div>

                <div>
                  <div className="mb-2 flex items-center gap-2">
                    <i className="fa-duotone fa-lock-keyhole text-neutral-400 text-sm" />
                    <label className="text-sm font-medium text-neutral-700">
                      Mật khẩu mới
                    </label>
                  </div>
                  <input
                    type="password"
                    placeholder="Nhập mật khẩu mới"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-xl border border-black/10 bg-white/80 px-4 py-3.5 text-sm text-neutral-900 outline-none backdrop-blur transition focus:border-black/20 focus:bg-white focus:shadow-[0_0_0_4px_rgba(0,0,0,0.03)]"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSave}
                    disabled={!isChanged || saving}
                    className={`w-full rounded-full py-3.5 text-sm font-medium text-white shadow-sm transition ${
                      !isChanged || saving
                        ? "cursor-not-allowed bg-neutral-300"
                        : "bg-neutral-900 hover:opacity-90 hover:shadow-md cursor-pointer"
                    }`}
                  >
                    {saving ? "Đang lưu" : "Lưu thay đổi"}
                  </button>
                </div>
              </div>
            </section>

            <section className="relative overflow-hidden rounded-[34px] border border-black/5 bg-white/60 p-6 shadow-[0_16px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl sm:p-8">
              <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-purple-100/25 to-transparent pointer-events-none" />

              <div className="relative mb-6">
                <div className="mb-2 flex items-center gap-2">
                  <i className="fa-duotone fa-images text-neutral-400 text-sm" />
                  <h2 className="text-lg font-semibold text-neutral-900">
                    Avatar cũ
                  </h2>
                </div>
                <p className="text-sm text-neutral-500">
                  Chọn lại avatar đã từng sử dụng.
                </p>
              </div>

              {avatarLoading ? (
                <div className="grid grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-3xl bg-black/10 animate-pulse"
                    />
                  ))}
                </div>
              ) : avatars.length === 0 ? (
                <div className="flex aspect-[1.1/1] items-center justify-center rounded-2xl border border-dashed border-black/10 bg-black/[0.02] text-center">
                  <div>
                    <i className="fa-duotone fa-image-slash text-2xl text-neutral-300" />
                    <p className="mt-3 text-sm text-neutral-400">
                      Chưa có avatar nào
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  {avatars.map((item) => (
                    <div
                      key={item.id}
                      className="group/avatar relative overflow-hidden rounded-3xl border border-white/70 bg-white/40 shadow-sm"
                    >
                      <img
                        src={item.url || DEFAULT_AVATAR}
                        className="aspect-square w-full object-cover transition duration-300 group-hover/avatar:scale-[1.03]"
                        onClick={() => handleReuse(item.url)}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src =
                            DEFAULT_AVATAR;
                        }}
                      />

                      {item.url === avatar && (
                        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium text-neutral-700 shadow-sm backdrop-blur">
                          Đang dùng
                        </div>
                      )}

                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/55 opacity-0 transition group-hover/avatar:opacity-100">
                        <button
                          className="rounded-full bg-white/95 px-5 py-2 text-sm font-medium text-neutral-900 shadow-sm transition hover:scale-[1.02] cursor-pointer"
                          onClick={() => handleReuse(item.url)}
                        >
                          Sử dụng
                        </button>

                        <button
                          className="rounded-full bg-red-500/95 px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:scale-[1.02] hidden"
                          onClick={() => handleDelete(item)}
                        >
                          Xoá
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </PremiumGlassCard>
    </main>
  );
}