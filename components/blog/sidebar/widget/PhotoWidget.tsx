"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getPhotoWidgetImage } from "@/lib/cloudinary";
import { extractPostTitle } from "@/lib/postMeta"; // ✅ 1. Import hàm chuẩn từ thư viện của bạn

type Photo = {
  id: string;
  src: string;
  href: string;
  title?: string;
};

// Đã xóa hàm extractTitle nội bộ bị lỗi ở đây để code sạch hơn

export default function PhotoWidget() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isMobile, setIsMobile] = useState(false);

  // detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // fetch
  useEffect(() => {
    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, images, content, created_at")
        .not("images", "eq", "{}")
        .order("created_at", { ascending: false }) // sắp xếp theo mới nhất trước
        .limit(9);

      if (error || !data) return;

      const mapped: Photo[] = data
        .filter((post) => post.images?.length > 0)
        .map((post) => {
          
          // ✅ 2. Dùng hàm extract chuẩn để lấy câu đầu tiên
          let safeTitle = extractPostTitle(post.content);
          
          // ✅ 3. Cắt giới hạn ký tự (VD: 90 ký tự) cho vừa vặn với UI Widget
          if (safeTitle.length > 60) {
            safeTitle = safeTitle.slice(0, 60).trim() + "...";
          }

          return {
            id: post.id,
            src: post.images[0],
            href: `/blog/${post.id}`,
            // Nếu không có title (bài chỉ có ảnh), fallback về ID bài viết
            title: safeTitle || `#${post.id.slice(0, 20)}`,
          };
        });

      setPhotos(mapped);
    };

    fetchPhotos();
  }, []);

  const displayPhotos = isMobile
    ? photos.slice(0, visibleCount)
    : photos;

  return (
    <div className="
      sm:rounded-2xl bg-white
      shadow-[0_8px_30px_rgba(0,0,0,0.04)]
      transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.075)]
      p-3 sm:p-4 px-0 pb-0 sm:pb-4 sm:px-4
    ">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 px-4 sm:px-0">
        <h3 className="text-[.9375rem] sm:text-base font-semibold">
          Ảnh
        </h3>

        {isMobile && visibleCount < photos.length && (
          <button
            onClick={() =>
              setVisibleCount((prev) => Math.min(prev + 3, 9))
            }
            className="text-sm text-gray-500 hover:text-gray-800 active:scale-95 cursor-pointer"
          >
            Xem thêm
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-3 gap-0.5 sm:gap-1 w-full">
        {displayPhotos.length === 0 ? (
          <>
            {/* Mobile skeleton: 3 */}
            <div className="contents lg:hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={`m-${i}`}
                  className="aspect-square sm:rounded-md bg-gray-200 animate-pulse"
                />
              ))}
            </div>

            {/* Desktop skeleton: 9 */}
            <div className="hidden lg:contents">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={`d-${i}`}
                  className="aspect-square sm:rounded-md bg-gray-200 animate-pulse"
                />
              ))}
            </div>
          </>
        ) : (
          displayPhotos.map((photo, index) => (
            <Link
              key={photo.id}
              href={photo.href}
              className="relative aspect-square rounded-0 sm:rounded-md overflow-hidden group"
            >
              <Image
                src={getPhotoWidgetImage(photo.src)}
                alt={photo.title || `photo-${index}`}
                fill
                unoptimized
                sizes="(max-width: 768px) 33vw, 200px"
                loading={index < 3 ? "eager" : "lazy"}
                className="object-cover transition-transform duration-900 ease-out group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition duration-300" />

              <div className="absolute inset-x-0 bottom-0 p-2 sm:translate-y-2 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition duration-300">
                <p className="text-[0.6875rem] sm:text-xs text-white/90 hover:text-white line-clamp-2">
                  {photo.title}
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}