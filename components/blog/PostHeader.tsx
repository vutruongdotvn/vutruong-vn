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

  const publishHref = showLink && postId ? `/blog/post/${postId}` : null;

  return (
    <>
      <div className="flex items-center justify-between px-3 pt-3 select-none sm:px-4 sm:pt-4 mb-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link href="/about">
            <Image
              src={avatar || "/images/default.jpg"}
              alt="Ảnh đại diện"
              width={30}
              height={30}
              sizes="30px"
              unoptimized
              className="w-[30px] h-[30px] rounded-full object-cover"
            />
          </Link>
          <div className="flex min-w-0 items-center gap-1.5 leading-none">
            <Link
              href="/about"
              className="flex h-5 items-center gap-1 cursor-pointer text-[14px] font-medium leading-none text-foreground hover:text-foreground transition"
            >
              {name}
              <i className="fas fa-badge-check inline-flex items-center text-[12px] leading-none text-blue-500" />
            </Link>

            <div className="flex h-5 items-center gap-1 leading-none">
              {isPinned && (
                <span
                  className="inline-flex h-5 items-center text-[14px] leading-none text-muted-foreground"
                >
                  đã ghim
                </span>
              )}

              {isPinned && (
                <span className="inline-flex h-5 items-center leading-none opacity-50 mx-0.25 text-[14px] text-muted-foreground">
                  •
                </span>
              )}

              <Link
                href={publishHref ?? ""}
                title={fullTime}
                aria-disabled={!publishHref}
                tabIndex={publishHref ? undefined : -1}
                onClick={
                  publishHref ? undefined : (event) => event.preventDefault()
                }
                className="postPublish inline-flex h-5 items-center text-[.8375rem] font-normal leading-none text-muted-foreground hover:text-foreground active:scale-98"
              >
                {time}
              </Link>

              <div className="flex items-center gap-1"
                onClick={() => {
                  if (!isAdmin) return;
                  setOpenPrivacyModal(true);
                  setOpen(false);
                }}>
                <span className="text-muted-foreground mx-0.25" aria-hidden="true">•</span>
                <i
                  className={`fadt text-xs cursor-pointer active:scale-98 
                    ${visibility === "privacy"
                      ? "fa-lock-keyhole text-red-600 dark:text-red-300"
                      : "fa-earth-asia text-foreground"
                    }`}
                  title={
                    visibility === "privacy"
                      ? "Bài viết riêng tư"
                      : "Bài viết công khai"
                  }
                  aria-label={
                    visibility === "privacy"
                      ? "Bài viết riêng tư"
                      : "Bài viết công khai"
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {showMenu && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpen(!open)}
              className="inline-flex items-center justify-center px-3 text-muted-foreground hover:text-foreground/75 cursor-pointer"
            >
              <i className="fa-duotone fa-ellipsis" />
            </button>

            {open && (
              <div className="animate-fadeIn absolute z-[3] top-0 right-0 w-55 rounded-xl bg-card p-1 shadow-2xl">
                <button
                  onClick={() => {
                    onPin?.();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-secondary active:bg-border cursor-pointer"
                >
                  <i className={`fadt ${isPinned ? "fa-thumbtack-slash" : "fa-thumbtack"}`} />
                  <span>{isPinned ? "Bỏ ghim" : "Ghim"}</span>
                </button>

                <button
                  onClick={() => {
                    onEdit?.();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-secondary active:bg-border cursor-pointer"
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
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-secondary active:bg-border cursor-pointer"
                >
                  <i className="fadt fa-calendar" />
                  <span>Thay đổi ngày đăng</span>
                </button>

                <button
                  onClick={() => {
                    setOpenPrivacyModal(true);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-secondary active:bg-border cursor-pointer"
                >
                  <i className="fadt fa-earth-asia" />
                  <span>Thay đổi đối tượng</span>
                </button>

                <button
                  onClick={() => {
                    onDelete?.();
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-red-100 dark:hover:bg-red-400/20 hover:text-red-600 dark:hover:text-red-300 active:bg-red-200 dark:active:bg-red-400/25 active:text-red-600 cursor-pointer"
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
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card/95 shadow-[0_25px_80px_rgba(0,0,0,0.18)] animate-fadeIn overflow-hidden">

              {/* Header */}
              <div className="border-b border-border/80 bg-card/90 px-5 py-4 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-medium text-sm sm:text-base">
                  <i className="fa-duotone fa-calendar" />
                  Thay đổi ngày đăng
                </div>

                <button
                  onClick={() => setOpenDateModal(false)}
                  className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted cursor-pointer active:scale-98"
                >
                  <i className="fa-duotone fa-xmark" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-3 bg-card">
                <input
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={selectedDate.slice(0, 10)}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full rounded-xl border border-border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
                />
                {isFutureDateTime() && (
                  <p className="text-xs text-red-500 px-1">
                    Không thể chọn ngày giờ lớn hơn hiện tại.
                  </p>
                )}

              </div>

              {/* Footer */}
              <div className="border-t border-border/80 bg-card/90 px-5 py-4 flex justify-end gap-2">
                <button
                  onClick={() => setOpenDateModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-foreground/75 hover:bg-muted cursor-pointer active:scale-98"
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
                  className="px-4 py-2 rounded-xl text-sm bg-primary text-primary-foreground disabled:opacity-50 cursor-pointer active:scale-98"
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
            <div className="relative z-10 w-full max-w-md rounded-2xl border border-border bg-card/95 shadow-[0_25px_80px_rgba(0,0,0,0.18)] animate-fadeIn overflow-hidden">

              {/* Header */}
              <div className="border-b border-border/80 bg-card/90 px-5 py-4 backdrop-blur-xl flex items-center justify-between">
                <div className="flex items-center gap-2 text-foreground font-medium text-sm sm:text-base">
                  <i className="fa-duotone fa-earth-asia" />
                  Chỉnh sửa đối tượng
                </div>

                <button
                  onClick={() => setOpenPrivacyModal(false)}
                  className="h-9 w-9 flex items-center justify-center rounded-full hover:bg-muted cursor-pointer active:scale-98"
                >
                  <i className="fa-duotone fa-xmark" />
                </button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-2 bg-card">

                {/* PUBLIC */}
                <div
                  onClick={() => setSelectedVisibility("public")}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition ${selectedVisibility === "public"
                    ? "border-primary bg-muted/50"
                    : "border-border hover:bg-muted/50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <i className="fa-duotone fa-earth-asia text-foreground/75" />
                    <span className="text-sm text-foreground">Công khai</span>
                  </div>

                  <div className={`h-4 w-4 rounded-full border ${selectedVisibility === "public"
                    ? "bg-primary border-primary"
                    : "border-border"
                    }`} />
                </div>

                {/* PRIVATE */}
                <div
                  onClick={() => setSelectedVisibility("privacy")}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl border cursor-pointer transition ${selectedVisibility === "privacy"
                    ? "border-primary bg-muted/50"
                    : "border-border hover:bg-muted/50"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <i className="fa-duotone fa-lock text-foreground/75" />
                    <span className="text-sm text-foreground">Riêng tư</span>
                  </div>

                  <div className={`h-4 w-4 rounded-full border ${selectedVisibility === "privacy"
                    ? "bg-primary border-primary"
                    : "border-border"
                    }`} />
                </div>

              </div>

              {/* Footer */}
              <div className="border-t border-border/80 bg-card/90 px-5 py-4 flex justify-end gap-2">
                <button
                  onClick={() => setOpenPrivacyModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-foreground/75 hover:bg-muted cursor-pointer active:scale-98"
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
                  className="px-4 py-2 rounded-xl text-sm bg-primary text-primary-foreground disabled:opacity-50 cursor-pointer active:scale-98"
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
