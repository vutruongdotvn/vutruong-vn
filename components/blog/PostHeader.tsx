"use client";

import Image from "next/image";
import Link from "next/link";

type Props = {
  name?: string;
  avatar?: string;
  createdAt: string;
  postId?: string;
  showLink?: boolean; // dùng cho PostCard
  showMenu?: boolean; // dấu ...
  timeFormat?: (date: string) => string; // inject formatTimeAgo nếu cần
};

export default function PostHeader({
  name,
  avatar,
  createdAt,
  postId,
  showLink = false,
  showMenu = false,
  timeFormat,
}: Props) {
  const time = timeFormat
    ? timeFormat(createdAt)
    : new Date(createdAt).toLocaleString();

  return (
    <div className="flex items-center justify-between px-3 pt-3">
      <div className="flex items-center gap-3">
        <Image
          src={avatar || "/avatar.JPEG"}
          alt="avatar"
          width={40}
          height={40}
          className="rounded-full object-cover"
          priority
        />

        <div className="leading-5">
          <Link className="flex items-center gap-1" href={`/bio`}>
            <span className="font-medium text-gray-800 hover:text-black text-base">
              {name || "Người dùng"}
            </span>
            <i className="fa-solid fa-badge-check text-blue-400 text-sm" />
          </Link>

          {showLink && postId ? (
            <Link href={`/blog/${postId}`} className="block group">
              <span className="block text-sm text-gray-500 hover:text-gray-800 font-normal">
                {time}
              </span>
            </Link>
          ) : (
            <div className="block group">
              <span className="block text-sm text-gray-500 hover:text-gray-800 font-normal">
                {time}
              </span>
            </div>
          )}
        </div>
      </div>

      {showMenu && (
        <button className="text-gray-400 hover:text-gray-600 cursor-pointer">
          <i className="fa-duotone fa-ellipsis"></i>
        </button>
      )}
    </div>
  );
}