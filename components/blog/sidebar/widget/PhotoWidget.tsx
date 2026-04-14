"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getPhotoWidgetImage } from "@/lib/cloudinary";

type Photo = {
  id: string;
  src: string;
  href: string;
  title?: string;
};

// extract câu đầu tiên làm title
function extractTitle(content: string): string {
  if (!content) return "Bài viết";

  const clean = content
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/\[(.*?)\]\(.*?\)/g, "$1")
    .replace(/```[\s\S]*?```/g, "");

  const first = clean.split(/[\n\.!?]/)[0];

  return first.trim().slice(0, 80) || "Bài viết";
}

export default function PhotoWidget() {
  const [photos, setPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, images, content, created_at")
        .not("images", "eq", "{}")
        .order("created_at", { ascending: false })
        .limit(9);

      if (error || !data) return;

      const mapped: Photo[] = data
        .filter((post) => post.images?.length > 0)
        .map((post) => ({
          id: post.id,
          src: post.images[0],
          href: `/blog/${post.id}`,
          title:
            typeof post.content === "string" && post.content.trim().length > 0
              ? extractTitle(post.content)
              : `#${post.id.slice(0, 20)}`, // nếu bài viết không có nội dung thì lấy ID làm tiêu đề
        }));

      setPhotos(mapped);
    };

    fetchPhotos();
  }, []);

  return (
  <div className="sm:rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.075)] p-3 sm:p-4">
    <h3 className="block text-[.9375rem] sm:text-base font-semibold mb-3">
      Ảnh
    </h3>

    <div className="grid grid-cols-3 gap-1 w-full">
      {(photos.length === 0
        ? Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-md bg-gradient-to-br from-gray-100 to-gray-200 dark:from-neutral-800 dark:to-neutral-700 animate-pulse"
            />
          ))
        : photos.map((photo, index) => (
            <Link
              key={photo.id}
              href={photo.href}
              className="relative aspect-square overflow-hidden rounded-md group"
            >
              <Image
                src={getPhotoWidgetImage(photo.src)}
                alt={photo.title || `photo-${index}`}
                fill
                unoptimized
                sizes="(max-width: 768px) 33vw, 200px"
                priority={index === 0}
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
              />

              {/* overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition duration-300" />

              {/* title */}
              <div className="absolute inset-x-0 bottom-0 p-2 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition duration-300">
                <p className="text-[11px] sm:text-xs text-white font-medium line-clamp-2">
                  {photo.title}
                </p>
              </div>
            </Link>
          )))}
    </div>
  </div>
);
}