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
    <div className="flex items-center justify-between px-3 sm:px-5 pt-3 sm:pt-5 select-none">
      <div className="flex items-center gap-2 min-w-0">
        {!hideAvatar && (
          <Image
            src={avatar || "/images/default.jpg"}
            alt="avatar"
            width={40}
            height={40}
            className="rounded-full object-cover aspect-square"
          />
        )}

        <div className="leading-6 flex items-center gap-1 min-w-0 flex-wrap">
          <div className="flex items-center justify-center gap-[3px] min-w-0 bg-slate-100 border border-slate-300 hover:border-slate-400 px-3 py-1 rounded-full cursor-pointer active:scale-97">
            <span className="text-sm text-slate-800 font-medium">
              {name}
            </span>
            <i
              className="fa-duotone fa-badge-check text-slate-500 hover:text-slate-600 text-xs cursor-pointer shrink-0"
              title="Tài khoản đã xác thực"
            />
          </div>

          <div className="flex items-center gap-1 ms-[4px] min-w-0 flex-wrap">
            {showLink && postId ? (
              <Link
  className="postPublish text-xs text-gray-500 hover:text-black font-normal active:scale-97"
  href={`/blog/${postId}`}
  title={fullTime}
>
  {time}
</Link>
            ) : (
              <span
  className="postPublish text-xs text-gray-500 font-normal"
  title={fullTime}
>
  {time}
</span>
            )}

            {isPinned && (
              <span className="text-gray-600 hover:text-black text-sm active:scale-95 cursor-pointer" title="Bài ghim">
                <i className="fa-duotone fa-thumbtack" />
              </span>
            )}
          </div>
        </div>
      </div>

      {showMenu && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-400 hover:text-gray-700 cursor-pointer px-3"
          >
            <i className="fa-duotone fa-ellipsis"></i>
          </button>

          {open && (
            <div className="absolute right-0 w-44 bg-white shadow-xl rounded-2xl z-50 border border-gray-100 overflow-hidden">
              <button
                onClick={() => {
                  onPin?.();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:text-green-600 text-sm flex items-center gap-2 cursor-pointer"
              >
                <i
                  className={`fa-duotone ${
                    isPinned ? "fa-thumbtack-slash" : "fa-thumbtack"
                  }`}
                />
                <span>{isPinned ? "Bỏ ghim" : "Ghim"}</span>
              </button>

              <button
                onClick={() => {
                  onEdit?.();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:text-amber-600 text-sm flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-duotone fa-edit" />
                <span>Chỉnh sửa</span>
              </button>

              <button
                onClick={() => {
                  onDelete?.();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:text-red-600 text-sm flex items-center gap-2 cursor-pointer"
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