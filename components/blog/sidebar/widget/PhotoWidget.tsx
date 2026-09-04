"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getPhotoWidgetImage } from "@/lib/cloudinary";
import { extractPostTitle } from "@/lib/postMeta"; // ✅ 1. Import hàm chuẩn từ thư viện của bạn
import { useUser } from "@/hooks/useUser";

type PhotoAccessScope = "public" | "admin";

type Photo = {
  id: string;
  src: string;
  href: string;
  title?: string;
  visibility: "public" | "privacy";
};

// Đã xóa hàm extractTitle nội bộ bị lỗi ở đây để code sạch hơn

export default function PhotoWidget() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isMobile, setIsMobile] = useState(false);
  const requestIdRef = useRef(0);
  const { user, role, loading: authLoading } = useUser();
  const accessScope: PhotoAccessScope | null = authLoading
    ? null
    : user && role === "admin"
      ? "admin"
      : "public";

  // detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Tải lại âm thầm khi quyền xem đổi; không thay widget bằng skeleton.
  useEffect(() => {
    if (!accessScope) return;

    const requestId = ++requestIdRef.current;
    let active = true;

    if (accessScope === "public") {
      setPhotos((current) =>
        current.filter((photo) => photo.visibility === "public"),
      );
    }

    const fetchPhotos = async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("id, images, content, created_at, visibility")
        .not("images", "eq", "{}")
        .order("created_at", { ascending: false }) // sắp xếp theo mới nhất trước
        .limit(9);

      if (!active || requestId !== requestIdRef.current || error || !data) {
        return;
      }

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
            href: `/blog/post/${post.id}`,
            // Nếu không có title (bài chỉ có ảnh), fallback về ID bài viết
            title: safeTitle || `#${post.id.slice(0, 20)}`,
            visibility:
              post.visibility === "public" ? "public" : "privacy",
          };
        });

      setPhotos(mapped);
    };

    void fetchPhotos();

    return () => {
      active = false;
    };
  }, [accessScope]);

  const authorizedPhotos =
    user && role === "admin"
      ? photos
      : photos.filter((photo) => photo.visibility === "public");
  const displayPhotos = isMobile
    ? authorizedPhotos.slice(0, visibleCount)
    : authorizedPhotos;

  return (
    <div className="
      hidden lg:block
      sm:rounded-2xl bg-card border border-border
      p-3 sm:p-4 px-0 pb-0 sm:pb-4 sm:px-4
    ">
      {/* Header */}
      <div className="mb-3 px-4 sm:px-0">
        <h3 className="flex items-center justify-between text-[.9375rem] sm:text-base w-full">
          <div className="font-semibold">Ảnh</div>
          <Link className="text-sm text-muted-foreground hover:text-foreground active:scale-95 cursor-pointer" href="/blog/photos">Xem thêm</Link>
        </h3>

        {isMobile && visibleCount < authorizedPhotos.length && (
          <button
            onClick={() =>
              setVisibleCount((prev) => Math.min(prev + 3, 9))
            }
            className="text-sm text-muted-foreground hover:text-foreground active:scale-95 cursor-pointer"
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
                  className="aspect-square sm:rounded-md bg-secondary animate-pulse"
                />
              ))}
            </div>

            {/* Desktop skeleton: 9 */}
            <div className="hidden lg:contents">
              {Array.from({ length: 9 }).map((_, i) => (
                <div
                  key={`d-${i}`}
                  className="aspect-square sm:rounded-md bg-secondary animate-pulse"
                />
              ))}
            </div>
          </>
        ) : (
          displayPhotos.map((photo, index) => (
            <Link
              key={photo.id}
              href={photo.href}
              className="postImages relative aspect-square rounded-0 sm:rounded-md overflow-hidden group"
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

              <div className="absolute inset-x-0 bottom-0 p-2 sm:translate-y-1 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition duration-300">
                <p className="text-[0.75rem] sm:text-xs text-white/90 hover:text-white line-clamp-2">
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
