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
};
export default function PostHeader({
  name,
  avatar,
  createdAt,
  postId,
  showLink = false,
  showMenu = false,
  isPinned = false,
  onPin,
  onEdit,
  onDelete,
}: Props) {
  const time = formatTimeAgo(createdAt);
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
    <div className="flex items-center justify-between px-3 pt-3">
      <div className="flex items-center gap-2">
        <Image
          src={avatar || "/avatar.JPEG"}
          alt="avatar"
          width={33}
          height={33}
          className="rounded-full object-cover aspect-square"
          priority
        />

        <div className="leading-5 flex items-center gap-1">
          <div className="flex items-center gap-[3px]">
            <span className="font-bold text-gray-800 text-sm">{name}</span>
            <i className="fa-solid fa-badge-check text-blue-500 text-xs" />
          </div>

          {showLink && postId ? (
            <Link href={`/blog/${postId}`}>
              <span className="text-xs text-gray-500 font-medium">{time}</span>
            </Link>
          ) : (
            <span className="text-xs text-gray-500 font-medium">{time}</span>
          )}
        </div>
      </div>

      {/* 🔥 MENU */}
      {showMenu && (
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpen(!open)}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <i className="fa-duotone fa-ellipsis"></i>
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg z-50">
              <button
  onClick={() => {
    onPin?.();
    setOpen(false);
  }}
  className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2 cursor-pointer"
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
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-duotone fa-edit" /> <span>Chỉnh sửa</span>
              </button>

              <button
                onClick={() => {
                  onDelete?.();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-duotone fa-trash" /> <span>Xóa</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
