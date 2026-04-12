"use client";

import Image from "next/image";
import { formatTimeAgo } from "@/lib/utils";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

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

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
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
            <i className="fad fa-badge-check text-xs text-blue-600" title="Tài khoản đã được xác thực" />
          </Link>

          <div className="flex items-center gap-1.5">
            {isPinned && (
              <span
                title={`${name} đã ghim bài viết này`}
                className="text-xs text-gray-600 hover:text-black active:scale-95 cursor-pointer"
              >
                <i className="fa-duotone fa-thumbtack text-xs" /> Bài ghim
                <span className="ml-1.5">•</span>
              </span>

            )}
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
            <div className="animate-fadeIn absolute top-0 right-0 z-50 w-55 overflow-hidden rounded-xl bg-white px-1 py-2 shadow-2xl">
              <button
                onClick={() => {
                  onPin?.();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
              >
                <i className={`fa-duotone ${isPinned ? "fa-thumbtack-slash" : "fa-thumbtack"}`} />
                <span>{isPinned ? "Bỏ ghim" : "Ghim"}</span>
              </button>

              <button
                onClick={() => {
                  onEdit?.();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
              >
                <i className="fa-duotone fa-edit" />
                <span>Chỉnh sửa</span>
              </button>

              <button
                onClick={() => {
                  onDelete?.();
                  setOpen(false);
                }}
                className="flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left text-sm hover:bg-red-100 hover:text-red-600 active:bg-red-200 active:text-red-600 cursor-pointer"
              >
                <i className="fa-duotone fa-trash" />
                <span>Xóa</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}