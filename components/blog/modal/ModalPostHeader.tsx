"use client";

import Image from "next/image";
import Link from "next/link";
import { getPostHeaderAvatarImage } from "@/lib/cloudinary";
import { formatTimeAgo } from "@/lib/utils";

type ModalPostHeaderProps = {
  name: string;
  avatar: string | null;
  createdAt: string;
  visibility?: "public" | "privacy";
};

export default function ModalPostHeader({
  name,
  avatar,
  createdAt,
  visibility = "public",
}: ModalPostHeaderProps) {
  const createdDate = new Date(createdAt);
  const hasValidDate = !Number.isNaN(createdDate.getTime());
  const fullTime = hasValidDate
    ? `${createdDate.toLocaleDateString("vi-VN", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Ho_Chi_Minh",
      })} lúc ${createdDate.toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Ho_Chi_Minh",
      })}`
    : undefined;

  return (
    <header className="flex min-w-0 items-center gap-2 p-3 pr-14 sm:p-4 sm:pr-16 select-none">
      <Image
        src={
          getPostHeaderAvatarImage(avatar || undefined) ||
          "/images/default.jpg"
        }
        alt={`Ảnh đại diện của ${name}`}
        width={36}
        height={36}
        sizes="36px"
        unoptimized
        className="h-9 w-9 shrink-0 rounded-full object-cover"
      />

      <div className="min-w-0 leading-tight">
        <Link
          href="/blog/about"
          className="inline-flex max-w-full items-center gap-1 rounded-sm text-sm font-medium text-slate-700 hover:text-slate-950 focus-visible:outline-none"
        >
          <span className="truncate">{name}</span>
          <i
            className="fa-duotone fa-badge-check shrink-0 text-xs text-blue-600"
            aria-hidden="true"
          />
        </Link>

        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
          <time
            dateTime={createdAt}
            title={fullTime}
            suppressHydrationWarning
          >
            {hasValidDate ? formatTimeAgo(createdAt) : "Không rõ thời gian"}
          </time>
          <span aria-hidden="true">•</span>
          <i
            className={`fa-duotone text-[11px] ${
              visibility === "privacy"
                ? "fa-lock-keyhole text-red-600"
                : "fa-earth-americas"
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
    </header>
  );
}
