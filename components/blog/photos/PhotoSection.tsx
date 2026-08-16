"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPhotoWidgetImage } from "@/lib/cloudinary";
import { extractPostTitle } from "@/lib/postMeta";
import { supabase } from "@/lib/supabase";

const BLOG_PHOTOS_PAGE_SIZE = 15;

type BlogPhoto = {
  id: string;
  src: string;
  title: string;
};

type BlogPhotoCursor = {
  createdAt: string;
  id: string;
};

type BlogPhotosPage = {
  photos: BlogPhoto[];
  nextCursor: BlogPhotoCursor | null;
};

type PhotoPostRow = {
  id: string;
  content: string | null;
  images: string[] | null;
  cover_image: string | string[] | null;
  created_at: string;
};

const GRID_CLASS =
  "grid grid-cols-3 gap-0.5 sm:gap-1 md:grid-cols-4 lg:grid-cols-5";

function getFirstValidUrl(value: string | string[] | null | undefined) {
  if (Array.isArray(value)) {
    return value.find((item) => typeof item === "string" && item.trim())?.trim();
  }

  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getPostPhoto(row: PhotoPostRow) {
  return getFirstValidUrl(row.cover_image) || getFirstValidUrl(row.images);
}

function getPhotoTitle(row: PhotoPostRow) {
  const title = extractPostTitle(row.content || "").trim();

  if (!title) return `Bài viết #${row.id}`;
  return title.length > 100 ? `${title.slice(0, 100).trim()}...` : title;
}

async function getBlogPhotosPage(
  cursor?: BlogPhotoCursor | null,
): Promise<BlogPhotosPage> {
  let query = supabase
    .from("posts")
    .select("id, content, images, cover_image, created_at")
    .not("images", "eq", "{}")
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(BLOG_PHOTOS_PAGE_SIZE + 1);

  if (cursor) {
    query = query.or(
      `created_at.lt.${cursor.createdAt},and(created_at.eq.${cursor.createdAt},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(error.message || "Không thể tải danh sách ảnh.");
  }

  const rows = (data || []) as PhotoPostRow[];
  const pageRows = rows.slice(0, BLOG_PHOTOS_PAGE_SIZE);
  const photos = pageRows.flatMap((row) => {
    const source = getPostPhoto(row);

    if (!source) return [];

    return [
      {
        id: String(row.id),
        src: getPhotoWidgetImage(source),
        title: getPhotoTitle(row),
      },
    ];
  });

  const lastRow = pageRows[pageRows.length - 1];

  return {
    photos,
    nextCursor:
      rows.length > BLOG_PHOTOS_PAGE_SIZE && lastRow
        ? {
            createdAt: lastRow.created_at,
            id: String(lastRow.id),
          }
        : null,
  };
}

function PhotoGridSkeleton({ count }: { count: number }) {
  return (
    <div className={GRID_CLASS} aria-hidden="true">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="aspect-square animate-pulse bg-slate-200 sm:rounded-lg"
        />
      ))}
    </div>
  );
}

function appendUniquePhotos(current: BlogPhoto[], incoming: BlogPhoto[]) {
  const knownIds = new Set(current.map((photo) => photo.id));
  return [
    ...current,
    ...incoming.filter((photo) => !knownIds.has(photo.id)),
  ];
}

export default function PhotoSection() {
  const [photos, setPhotos] = useState<BlogPhoto[]>([]);
  const [nextCursor, setNextCursor] = useState<BlogPhotoCursor | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const loadFirstPage = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setInitialLoading(true);
    setLoadingMore(false);
    setError(null);

    try {
      const page = await getBlogPhotosPage();
      if (requestId !== requestIdRef.current) return;

      setPhotos(page.photos);
      setNextCursor(page.nextCursor);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return;

      setPhotos([]);
      setNextCursor(null);
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải danh sách ảnh.",
      );
    } finally {
      if (requestId === requestIdRef.current) setInitialLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    let currentUserId: string | null | undefined;
    let refreshTimer: number | undefined;

    const refreshForSession = (userId: string | null) => {
      if (!active || currentUserId === userId) return;
      currentUserId = userId;

      // Supabase khuyến nghị callback auth kết thúc trước khi chạy một query
      // khác trên cùng client, vì vậy lịch tải ảnh sang task kế tiếp.
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
      refreshTimer = window.setTimeout(() => {
        if (active) void loadFirstPage();
      }, 0);
    };

    // Chờ Supabase khôi phục phiên trước khi query để admin nhận đúng dữ liệu
    // privacy theo RLS, nhưng không phát sinh thêm truy vấn bảng profiles.
    void supabase.auth.getSession().then(({ data }) => {
      refreshForSession(data.session?.user.id ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      refreshForSession(session?.user.id ?? null);
    });

    return () => {
      active = false;
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
      requestIdRef.current += 1;
      subscription.unsubscribe();
    };
  }, [loadFirstPage]);

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return;

    const requestId = ++requestIdRef.current;
    setLoadingMore(true);
    setError(null);

    try {
      const page = await getBlogPhotosPage(nextCursor);
      if (requestId !== requestIdRef.current) return;

      setPhotos((current) => appendUniquePhotos(current, page.photos));
      setNextCursor(page.nextCursor);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) return;

      setError(
        loadError instanceof Error
          ? loadError.message
          : "Không thể tải thêm ảnh.",
      );
    } finally {
      if (requestId === requestIdRef.current) setLoadingMore(false);
    }
  };

  return (
    <section
      aria-labelledby="blog-photos-title"
      className="bg-white px-0 py-4 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sm:rounded-2xl sm:p-4"
    >
      <header className="mb-3 flex flex-col items-start justify-center gap-1 px-3 sm:px-0">
        <h1
          id="blog-photos-title"
          className="text-lg font-bold text-slate-900 sm:text-xl"
        >
          Ảnh
        </h1>
        <div className="text-sm text-slate-400 hover:text-slate-600 transition duration-300">Tất cả ảnh trong Blog, bấm vào ảnh để xem bài viết.</div>
      </header>

      {initialLoading ? (
        <PhotoGridSkeleton count={BLOG_PHOTOS_PAGE_SIZE} />
      ) : photos.length === 0 ? (
        <div className="flex min-h-52 flex-col items-center justify-center px-4 text-center text-slate-500">
          <i
            className="fal fa-images mb-3 text-3xl text-slate-300"
            aria-hidden="true"
          />
          <p className="text-sm font-medium text-slate-600">
            {error ? "Chưa thể tải ảnh" : "Chưa có bài viết nào chứa ảnh"}
          </p>
          {error && (
            <button
              type="button"
              onClick={() => void loadFirstPage()}
              className="mt-3 cursor-pointer rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200 active:scale-95"
            >
              Thử lại
            </button>
          )}
        </div>
      ) : (
        <>
          <div className={GRID_CLASS}>
            {photos.map((photo) => (
              <Link
                key={photo.id}
                href={`/blog/${photo.id}`}
                prefetch={false}
                aria-label={`Mở bài viết: ${photo.title}`}
                title={photo.title}
                className="group relative aspect-square overflow-hidden bg-slate-100 outline-none sm:rounded-lg focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  unoptimized
                  loading="lazy"
                  sizes="(max-width: 639px) 50vw, (max-width: 767px) 33vw, (max-width: 1023px) 25vw, 20vw"
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035]"
                />
              </Link>
            ))}

            {loadingMore &&
              Array.from({ length: BLOG_PHOTOS_PAGE_SIZE }).map((_, index) => (
                <div
                  key={`loading-more-${index}`}
                  className="aspect-square animate-pulse bg-slate-200 sm:rounded-lg"
                  aria-hidden="true"
                />
              ))}
          </div>

          <div className="px-3 sm:px-0">
            {error && (
              <p
                role="alert"
                className="mt-4 text-center text-sm text-red-500"
              >
                {error}
              </p>
            )}

            {nextCursor && (
              <div className="mt-5 flex justify-center">
                <button
                  type="button"
                  onClick={() => void loadMore()}
                  disabled={loadingMore}
                  aria-busy={loadingMore}
                  className="inline-flex min-w-32 cursor-pointer items-center justify-center gap-2 rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 active:scale-95 disabled:cursor-wait disabled:opacity-70"
                >
                  {loadingMore && (
                    <i
                      className="fal fa-spinner-third animate-spin"
                      aria-hidden="true"
                    />
                  )}
                  {loadingMore ? "Đang tải..." : "Tải thêm"}
                </button>
              </div>
            )}
          </div>
        </>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {loadingMore
          ? "Đang tải thêm ảnh..."
          : !initialLoading && photos.length > 0
            ? `Đã tải ${photos.length} ảnh.`
            : ""}
      </span>
    </section>
  );
}