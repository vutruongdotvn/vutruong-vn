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

  const renderTimeContent = () => (
    <span className="text-sm text-gray-500 hover:text-black font-normal flex items-center gap-1">
      {time}

      {isPinned && (
        <>
          <span className="text-gray-400">•</span>
          <span className="text-gray-500 font-normal flex items-center gap-[4px]">
            <i className="fa-duotone fa-thumbtack text-[10px]" />
            Bài ghim
          </span>
        </>
      )}
    </span>
  );

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
    <div className="flex items-center justify-between px-5 pt-5 select-none">
      <div className="flex items-center gap-2 min-w-0">
        {!hideAvatar && (
          <Image
            src={avatar || "/images/default.jpg"}
            alt="avatar"
            width={40}
            height={40}
            className="rounded-full object-cover aspect-square"
            priority
          />
        )}

        <div className="leading-6 flex items-center gap-1 min-w-0 flex-wrap">
          <div className="flex items-center gap-[3px] min-w-0 bg-neutral-100 border border-neutral-300 hover:border-neutral-400 px-3 py-1 rounded-full cursor-pointer">
            <span className="text-sm text-neutral-800 font-bold">
              {name}
            </span>
            <i
              className="fa-solid fa-badge-check text-neutral-500 hover:text-neutral-600 text-xs cursor-pointer shrink-0"
              title="Tài khoản đã xác thực"
            />
          </div>


          {showLink && postId ? (
            <Link className="ms-[6px]" href={`/blog/${postId}`}>{renderTimeContent()}</Link>
          ) : (
            renderTimeContent()
          )}
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
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center gap-2 cursor-pointer"
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
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center gap-2 cursor-pointer"
              >
                <i className="fa-duotone fa-edit" />
                <span>Chỉnh sửa</span>
              </button>

              <button
                onClick={() => {
                  onDelete?.();
                  setOpen(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center gap-2 cursor-pointer"
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