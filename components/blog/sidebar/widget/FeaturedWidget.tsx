"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TouchEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { getFeaturedWidgetImage } from "@/lib/cloudinary";
import { fetchFeaturedStories } from "@/lib/featuredStoryService";
import type { FeaturedStory } from "@/types/featuredStory";
import FeaturedManagerModal from "@/components/blog/sidebar/widget/featured/FeaturedManagerModal";

const STORIES_PER_PAGE = 3;
const SWIPE_THRESHOLD = 45;

function chunkStories(stories: FeaturedStory[]) {
  const pages: FeaturedStory[][] = [];

  for (let index = 0; index < stories.length; index += STORIES_PER_PAGE) {
    pages.push(stories.slice(index, index + STORIES_PER_PAGE));
  }

  return pages;
}

export default function FeaturedWidget() {
  const { role, status } = useUser();
  const isAdmin = role === "admin" && status === "approved";

  const [stories, setStories] = useState<FeaturedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(0);
  const [managerOpen, setManagerOpen] = useState(false);
  const touchStartXRef = useRef<number | null>(null);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const loadStories = useCallback(async () => {
    try {
      const nextStories = await fetchFeaturedStories();
      setStories(nextStories);
      setLoadError(false);
    } catch (error) {
      console.error("FeaturedWidget fetch error:", error);
      setLoadError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStories();
  }, [loadStories]);

  useEffect(() => {
    const scheduleReload = () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      reloadTimerRef.current = setTimeout(loadStories, 120);
    };

    const channel = supabase
      .channel("featured-widget")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "featured_stories" },
        scheduleReload
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "featured_story_images" },
        scheduleReload
      )
      .subscribe();

    return () => {
      if (reloadTimerRef.current) clearTimeout(reloadTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [loadStories]);

  const visibleStories = useMemo(
    () => stories.filter((story) => story.images.length > 0),
    [stories]
  );

  const pages = useMemo(() => chunkStories(visibleStories), [visibleStories]);
  const pageCount = pages.length;

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(pageCount - 1, 0)));
  }, [pageCount]);

  const goPrev = () => setPage((current) => Math.max(current - 1, 0));
  const goNext = () =>
    setPage((current) => Math.min(current + 1, pageCount - 1));

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;

    const endX = event.changedTouches[0]?.clientX ?? touchStartXRef.current;
    const distance = endX - touchStartXRef.current;
    touchStartXRef.current = null;

    if (Math.abs(distance) < SWIPE_THRESHOLD) return;
    if (distance > 0) goPrev();
    else goNext();
  };

  if (!loading && visibleStories.length === 0 && !isAdmin) return null;

  return (
    <>
      <section className="rounded-none bg-white p-3 px-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.075)] sm:rounded-2xl sm:p-4">
        <div className="mb-3 flex items-center justify-between px-4 sm:px-0">
          <h3 className="text-[.9375rem] font-semibold sm:text-base">
            Tin nổi bật
          </h3>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setManagerOpen(true)}
              title="Quản lý Tin nổi bật"
              aria-label="Quản lý Tin nổi bật"
              className="flex size-8 cursor-pointer items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 active:scale-95"
            >
              <i className="fad fa-sliders" aria-hidden="true" />
            </button>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-1.5 px-3 sm:px-0">
            {Array.from({ length: 3 }).map((_, index) => (
              <div
                key={index}
                className="aspect-[3/4] animate-pulse rounded-xl bg-neutral-100"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="px-4 py-7 text-center text-sm text-neutral-500 sm:px-0">
            Chưa thể tải Tin nổi bật.
          </div>
        ) : visibleStories.length === 0 ? (
          <button
            type="button"
            onClick={() => setManagerOpen(true)}
            className="mx-3 flex w-[calc(100%-1.5rem)] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 py-8 text-sm text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-800 sm:mx-0 sm:w-full"
          >
            <i className="fad fa-images text-xl" aria-hidden="true" />
            Thêm Tin nổi bật đầu tiên
          </button>
        ) : (
          <div className="relative px-3 sm:px-0">
            <div
              className="overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            >
              <div
                className="flex transition-transform duration-500 ease-out"
                style={{ transform: `translateX(-${page * 100}%)` }}
              >
                {pages.map((storyPage, pageIndex) => (
                  <div
                    key={pageIndex}
                    className="grid min-w-full grid-cols-3 gap-1.5"
                  >
                    {storyPage.map((story, storyIndex) => {
                      const [cover, ...remainingImages] = story.images;
                      const gallery = `featured-${story.id}`;
                      const globalIndex =
                        pageIndex * STORIES_PER_PAGE + storyIndex;

                      return (
                        <div key={story.id} className="min-w-0">
                          <a
                            href={cover.secure_url}
                            data-fancybox={gallery}
                            className="group relative block aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100"
                            title="Bấm để xem Tin nổi bật"
                          >
                            <Image
                              src={getFeaturedWidgetImage(cover.secure_url)}
                              alt={`Tin nổi bật ${globalIndex + 1}`}
                              fill
                              unoptimized
                              sizes="(max-width: 1024px) 33vw, 150px"
                              loading={globalIndex < 3 ? "eager" : "lazy"}
                              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                            />

                            <span className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent opacity-80" />

                            {remainingImages.length > 0 && (
                              <span className="absolute bottom-2 left-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                                +{remainingImages.length}
                              </span>
                            )}
                          </a>

                          {remainingImages.length > 0 && (
                            <div className="hidden">
                              {remainingImages.map((image) => (
                                <a
                                  key={image.id}
                                  href={image.secure_url}
                                  data-fancybox={gallery}
                                  aria-hidden="true"
                                  tabIndex={-1}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {page > 0 && (
              <button
                type="button"
                onClick={goPrev}
                title="3 Tin nổi bật trước"
                aria-label="3 Tin nổi bật trước"
                className="absolute -left-1 top-1/2 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/5 bg-white/95 text-neutral-800 shadow-md backdrop-blur transition hover:scale-105 active:scale-95"
              >
                <i className="fad fa-chevron-left" aria-hidden="true" />
              </button>
            )}

            {page < pageCount - 1 && (
              <button
                type="button"
                onClick={goNext}
                title="3 Tin nổi bật tiếp theo"
                aria-label="3 Tin nổi bật tiếp theo"
                className="absolute -right-1 top-1/2 z-10 flex size-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-black/5 bg-white/95 text-neutral-800 shadow-md backdrop-blur transition hover:scale-105 active:scale-95"
              >
                <i className="fad fa-chevron-right" aria-hidden="true" />
              </button>
            )}
          </div>
        )}
      </section>

      {isAdmin && (
        <FeaturedManagerModal
          open={managerOpen}
          stories={stories}
          onClose={() => setManagerOpen(false)}
          onChanged={loadStories}
        />
      )}
    </>
  );
}
