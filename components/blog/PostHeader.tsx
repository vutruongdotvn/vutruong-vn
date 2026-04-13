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

  const [selectedDate, setSelectedDate] = useState(createdAt);
  const [selectedTime, setSelectedTime] = useState(
    new Date(createdAt).toTimeString().slice(0, 5)
  );

  const [selectedVisibility, setSelectedVisibility] = useState(visibility);

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

    const iso = new Date(`${selectedDate}T${selectedTime}`).toISOString();
    const updated = await updatePostDate(postId, iso);

    onUpdated?.(updated);
    setOpenDateModal(false);
  };

  const handleChangeVisibility = async () => {
    if (!postId) return;

    const updated = await updatePostVisibility(postId, selectedVisibility);

    onUpdated?.(updated);
    setOpenPrivacyModal(false);
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
            sizes="40px"
            unoptimized
            className="size-10 rounded-full object-cover"
          />

          <div className="flex flex-col gap-0.75">
            <Link
              href="/bio"
              className="flex items-center gap-0.5 text-sm font-medium text-gray-700 hover:text-black active:scale-95"
            >
              {name}
              <i className="fad fa-badge-check text-xs text-blue-600" />
            </Link>

            <div className="flex items-center gap-1.5">
              {isPinned && (
                <span
                  title={`${name} đã ghim bài viết này`}
                  className="text-xs text-gray-600 hover:text-black"
                >
                  <i className="fa-duotone fa-thumbtack text-xs" /> Bài ghim
                </span>
              )}

              {isPinned && <span className="opacity-50">•</span>}

              {showLink && postId ? (
                <Link
                  href={`/blog/${postId}`}
                  title={fullTime}
                  className="postPublish inline-flex items-center text-xs font-normal text-gray-600 hover:text-black active:scale-95"
                >
                  {time}
                </Link>
              ) : (
                <span
                  title={fullTime}
                  className="postPublish inline-flex items-center text-xs font-normal text-gray-600 hover:text-black active:scale-95"
                >
                  {time}
                </span>
              )}

              {/* ✅ BẬT LOGIC */}
              {visibility === "public" ? (
                <i className="fadt fa-earth-asia text-xs cursor-pointer active:scale-95" title="Công khai" />
              ) : (
                <i className="fadt fa-lock text-xs cursor-pointer active:scale-95" title="Riêng tư" />
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
                    setOpenDateModal(true);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <i className="fadt fa-calendar" />
                  <span>Thay đổi ngày</span>
                </button>

                <button
                  onClick={() => {
                    setOpenPrivacyModal(true);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                >
                  <i className="fadt fa-earth-asia" />
                  <span>Thay đổi quyền xem</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded-xl w-[320px]">
            <input type="date" value={selectedDate.slice(0, 10)} onChange={(e) => setSelectedDate(e.target.value)} />
            <input type="time" value={selectedTime} onChange={(e) => setSelectedTime(e.target.value)} />
            <button onClick={() => setOpenDateModal(false)}>Hủy</button>
            <button onClick={handleChangeDate}>Xong</button>
          </div>
        </div>
      )}

      {openPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-4 rounded-xl w-[320px]">
            <label>
              <input type="radio" checked={selectedVisibility === "public"} onChange={() => setSelectedVisibility("public")} />
              Công khai
            </label>
            <label>
              <input type="radio" checked={selectedVisibility === "privacy"} onChange={() => setSelectedVisibility("privacy")} />
              Riêng tư
            </label>
            <button onClick={() => setOpenPrivacyModal(false)}>Hủy</button>
            <button onClick={handleChangeVisibility}>Xong</button>
          </div>
        </div>
      )}
    </>
  );
}