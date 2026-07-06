"use client";

import Image from "next/image";
import { formatTimeAgo } from "@/lib/utils";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { updatePostDate, updatePostVisibility } from "@/services/postService";

type Props = {
  name?: string;
  avatar?: string;
  createdAt: string;
  postId?: string;
  showLink?: boolean;
  showMenu?: boolean;
  isPinned?: boolean;
  onPin?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  hideAvatar?: boolean;

  // ✅ thêm, không phá
  visibility?: "public" | "privacy";
  isAdmin?: boolean;
  onUpdated?: (data: any) => void;
};

export default function PostHeader({
  name,
  avatar,
  createdAt,
  postId,
  showLink = true,
  showMenu = false,
  isPinned = false,
  onPin,
  onEdit,
  onDelete,
  hideAvatar = false,

  visibility = "public",
  isAdmin = false,
  onUpdated,
}: Props) {

  const time = formatTimeAgo(createdAt);

  const isFutureDateTime = () => {
    const now = new Date();

    const selected = new Date(
      `${selectedDate.slice(0, 10)}T${selectedTime}`
    );

    return selected.getTime() > now.getTime();
  };

  const date = new Date(createdAt);
  const fullTime = `${date.toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })} lúc ${date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // ===== NEW STATE =====
  const [openDateModal, setOpenDateModal] = useState(false);
  const [openPrivacyModal, setOpenPrivacyModal] = useState(false);
  const [savingPrivacy, setSavingPrivacy] = useState(false);
  const [selectedDate, setSelectedDate] = useState(createdAt);
  const [selectedTime, setSelectedTime] = useState(
    new Date(createdAt).toTimeString().slice(0, 5)
  );

  const [selectedVisibility, setSelectedVisibility] = useState(visibility);

  useEffect(() => {
    const isAnyModalOpen = openDateModal || openPrivacyModal;

    if (isAnyModalOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [openDateModal, openPrivacyModal]);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ===== HANDLERS =====
  const handleChangeDate = async () => {
    if (!postId) return;

    // 🚨 validate trước
    if (!selectedDate || !selectedTime) {
      console.error("Thiếu date hoặc time");
      return;
    }

    const date = new Date(`${selectedDate}T${selectedTime}`);

    if (isNaN(date.getTime())) {
      console.error("Invalid date");
      return;
    }

    // 🚫 chặn future
    if (date.getTime() > Date.now()) {
      console.error("Future date blocked");
      return;
    }

    const iso = date.toISOString();

    const updated = await updatePostDate(postId, iso);

    // 🔥 REALTIME EVENT
    window.dispatchEvent(
      new CustomEvent("blog-post-updated", {
        detail: updated,
      })
    );

    onUpdated?.(updated);
    setOpenDateModal(false);
  };

  const handleChangeVisibility = async () => {
    if (!postId) return;

    const updated = await updatePostVisibility(postId, selectedVisibility);

    // 🔥 REALTIME EVENT
    window.dispatchEvent(
      new CustomEvent("blog-post-updated", {
        detail: updated,
      })
    );

    onUpdated?.(updated);
    setTimeout(() => {
      setOpenPrivacyModal(false);
    }, 50);
  };

  return (
    <>
      <div className="flex items-center justify-between px-3 pt-3 select-none sm:px-4 sm:pt-4">
        <div className="flex min-w-0 items-center gap-2">
          <Image
            src={avatar || "/images/default.jpg"}
            alt="avatar"
            width={40}
            height={40}
            sizes="100px"
            unoptimized
            className="w-[40px] h-[40px] rounded-full object-cover pointer-events-none"
          />

          <div className="flex flex-col gap-0.75">
            <span
              className="flex items-center gap-1 cursor-pointer text-sm font-medium text-gray-800 hover:text-black active:scale-97"
            >
              {name}
              <i className="fad fa-badge-check text-xs text-blue-600" title="Tài khoản đã được xác thực." />
            </span>

            <div className="flex items-center gap-1.5">
              {isPinned && (
                <span
                  title={`${name} đã ghim bài viết này`}
                  className="text-xs text-gray-600 hover:text-black"
                >
                  <i className="fa-duotone fa-thumbtack text-xs" /> Bài ghim
                </span>
              )}

              {isPinned && <span className="opacity-50 text-xs">•</span>}

              {showLink && postId ? (
                <Link
                  href={`/blog/${postId}`}
                  title={fullTime}
                  className="postPublish inline-flex items-center text-xs font-normal text-gray-600 hover:text-black active:scale-97"
                >
                  {time}
                </Link>
              ) : (
                <span
                  title={fullTime}
                  className="postPublish inline-flex items-center text-xs font-normal text-gray-600 hover:text-black active:scale-97"
                >
                  {time}
                </span>
              )}

              {/* ✅ BẬT LOGIC */}
              {visibility === "public" ? (
                <i
                  onClick={() => {
                    if (!isAdmin) return; // 🔒 CHECK QUYỀN
                    setOpenPrivacyModal(true);
                    setOpen(false);
                  }}
                  className={`fadt fa-earth-asia text-xs active:scale-97 cursor-pointer ${isAdmin ? "" : "publicPost"
                    }`}
                  title="Công khai"
                />
              ) : (
                <i
                  onClick={() => {
                    if (!isAdmin) return; // 🔒 CHECK QUYỀN
                    setOpenPrivacyModal(true);
                    setOpen(false);
                  }}
                  className={`fadt fa-lock text-xs active:scale-97 cursor-pointer ${isAdmin ? "" : "privacyPost"
                    }`}
                  title="Riêng tư"
                />
              )}
            </div>
          </div>
        </div>

        {showMenu && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex items-center justify-center px-3 text-gray-400 hover:text-gray-700 cursor-pointer"
            >
              <i className="fa-duotone fa-ellipsis" />
            </button>

            {open && (
              <div className="animate-fadeIn absolute z-[3] top-0 right-0 w-55 rounded-xl bg-white p-1 shadow-2xl">
                <button
                  onClick={() => {
                    onPin?.();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <i className={`fadt ${isPinned ? "fa-thumbtack-slash" : "fa-thumbtack"}`} />
                  <span>{isPinned ? "Bỏ ghim" : "Ghim"}</span>
                </button>

                <button
                  onClick={() => {
                    onEdit?.();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <i className="fadt fa-pen" />
                  <span>Chỉnh sửa</span>
                </button>

                {/* ✅ FIX LOGIC */}
                <button
                  onClick={() => {
                    const d = new Date(createdAt);

                    setSelectedDate(d.toISOString().slice(0, 10));
                    setSelectedTime(d.toTimeString().slice(0, 5));

                    setOpenDateModal(true);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <i className="fadt fa-calendar" />
                  <span>Thay đổi ngày đăng</span>
                </button>

                <button
                  onClick={() => {
                    setOpenPrivacyModal(true);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <i className="fadt fa-earth-asia" />
                  <span>Thay đổi đối tượng</span>
                </button>

                <button
                  onClick={() => {
                    onDelete?.();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-red-100 hover:text-red-600 active:bg-red-200 active:text-red-600 cursor-pointer"
                >
                  <i className="fadt fa-trash" />
                  <span>Xóa</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      {openDateModal && (
        <>
          {/* LOCK SCROLL */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"
              onClick={() => {
                const isChanged =
                  selectedDate.slice(0, 10) !== createdAt.slice(0, 10) ||
                  selectedTime !== new Date(createdAt).toTimeString().slice(0, 5);

                if (!isChanged) setOpenDateModal(false);
              }}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 bg-white/95 shadow-[0_25px_80px_rgba(0,0,0,0.18)] animate-fadeIn overflow-hidden">

              {/* Header */}
              <div className="border-b border-gray-100/80 bg-white/90 px-5 py-4 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-800 font-medium text-sm sm:text-base">
                  <i className="fa-duotone fa-calendar" />
                  Thay đổi ngày đăng
                </div>

                <button
                  onClick={() => setOpenDateModal(false)}
                  className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer active:scale-97"
                >
                  <i className="fa-duotone fa-xmark" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3 bg-white">
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={selectedDate.slice(0, 10)}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-300"
                />
                {isFutureDateTime() && (
                  <p className="text-xs text-red-500 px-1">
                    Không thể chọn ngày giờ lớn hơn hiện tại.
                  </p>
                )}

              </div>

              {/* Footer */}
              <div className="border-t border-gray-100/80 bg-white/90 px-5 py-4 flex justify-end gap-2">
                <button
                  onClick={() => setOpenDateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 cursor-pointer active:scale-97"
                >
                  Hủy
                </button>

                <button
                  onClick={async (e) => {
                    const btn = e.currentTarget as HTMLButtonElement;

                    try {
                      btn.disabled = true;
                      btn.innerHTML = `<i class="fa-duotone fa-spinner-third fa-spin mr-1"></i> Đang lưu`;

                      await handleChangeDate();
                    } catch (err) {
                      console.error(err);
                    } finally {
                      btn.disabled = false;
                      btn.innerHTML = "Xong";
                    }
                  }}
                  disabled={
                    isFutureDateTime() ||
                    (selectedDate.slice(0, 10) === createdAt.slice(0, 10) &&
                      selectedTime === new Date(createdAt).toTimeString().slice(0, 5))
                  }
                  className="px-4 py-2 rounded-xl text-sm bg-gray-900 text-white disabled:opacity-50 cursor-pointer active:scale-97"
                >
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {openPrivacyModal && (
        <>
          {/* LOCK SCROLL */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"
              onClick={() => {
                if (selectedVisibility === visibility) {
                  setOpenPrivacyModal(false);
                }
              }}
            />

            {/* Modal */}
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-white/60 bg-white/95 shadow-[0_25px_80px_rgba(0,0,0,0.18)] animate-fadeIn overflow-hidden">

              {/* Header */}
              <div className="border-b border-gray-100/80 bg-white/90 px-5 py-4 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-800 font-medium text-sm sm:text-base">
                  <i className="fa-duotone fa-earth-asia" />
                  Chỉnh sửa đối tượng
                </div>

                <button
                  onClick={() => setOpenPrivacyModal(false)}
                  className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-gray-100 cursor-pointer active:scale-97"
                >
                  <i className="fa-duotone fa-xmark" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-2 bg-white">

                {/* PUBLIC */}
                <div
                  onClick={() => setSelectedVisibility("public")}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition ${selectedVisibility === "public"
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <i className="fa-duotone fa-earth-asia text-gray-700" />
                    <span className="text-sm text-gray-800">Công khai</span>
                  </div>

                  <div className={`h-4 w-4 rounded-full border ${selectedVisibility === "public"
                    ? "bg-gray-900 border-gray-900"
                    : "border-gray-300"
                    }`} />
                </div>

                {/* PRIVATE */}
                <div
                  onClick={() => setSelectedVisibility("privacy")}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition ${selectedVisibility === "privacy"
                    ? "border-gray-900 bg-gray-50"
                    : "border-gray-200 hover:bg-gray-50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <i className="fa-duotone fa-lock text-gray-700" />
                    <span className="text-sm text-gray-800">Riêng tư</span>
                  </div>

                  <div className={`h-4 w-4 rounded-full border ${selectedVisibility === "privacy"
                    ? "bg-gray-900 border-gray-900"
                    : "border-gray-300"
                    }`} />
                </div>

              </div>

              {/* Footer */}
              <div className="border-t border-gray-100/80 bg-white/90 px-5 py-4 flex justify-end gap-2">
                <button
                  onClick={() => setOpenPrivacyModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 cursor-pointer active:scale-97"
                >
                  Hủy
                </button>

                <button
                  onClick={async () => {
                    if (selectedVisibility === visibility) return;

                    setSavingPrivacy(true);
                    await handleChangeVisibility();
                    setSavingPrivacy(false);
                  }}
                  disabled={selectedVisibility === visibility || savingPrivacy}
                  className="px-4 py-2 rounded-xl text-sm bg-gray-900 text-white disabled:opacity-50 cursor-pointer active:scale-97"
                >
                  {savingPrivacy ? (
                    <>
                      <i className="fa-duotone fa-spinner-third fa-spin mr-1" />
                      Đang lưu
                    </>
                  ) : (
                    "Lưu thay đổi"
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}