"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { getFeaturedWidgetImage } from "@/lib/cloudinary";
import { fetchFeaturedStories } from "@/lib/featuredStoryService";
import type { FeaturedStory } from "@/types/featuredStory";
import FeaturedManagerModal from "@/components/blog/sidebar/widget/featured/FeaturedManagerModal";

const VISIBLE_STORIES = 3;

export default function FeaturedWidget() {
  const { role, status } = useUser();
  const isAdmin = role === "admin" && status === "approved";

  const [stories, setStories] = useState<FeaturedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    duration: 32,
    loop: false,
    skipSnaps: false,
    slidesToScroll: VISIBLE_STORIES,
    breakpoints: {
      "(prefers-reduced-motion: reduce)": { duration: 0 },
    },
  });

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

  const syncNavigationState = useCallback(() => {
    if (!emblaApi) return;

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    syncNavigationState();
    emblaApi.on("select", syncNavigationState);
    emblaApi.on("reInit", syncNavigationState);

    return () => {
      emblaApi.off("select", syncNavigationState);
      emblaApi.off("reInit", syncNavigationState);
    };
  }, [emblaApi, syncNavigationState]);

  const goPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const goNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  if (!loading && visibleStories.length === 0 && !isAdmin) return null;

  return (
    <>
      <section className="rounded-none bg-white p-3 px-0 shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_12px_40px_rgba(0,0,0,0.075)] sm:rounded-2xl sm:p-4">
        <div className="mb-3 flex items-center justify-between px-4 sm:px-0">
          <h3 className="text-[.9375rem] font-semibold sm:text-base">
            Khoảnh khắc
          </h3>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setManagerOpen(true)}
              title="Quản lý Khoảnh khắc"
              aria-label="Quản lý Khoảnh khắc"
              className="flex cursor-pointer items-center justify-center rounded-full text-neutral-500 hover:text-neutral-900 active:scale-97"
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
                className="aspect-[9/16] animate-pulse rounded-xl bg-neutral-100"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="px-4 py-7 text-center text-sm text-neutral-500 sm:px-0">
            Chưa thể tải Khoảnh khắc.
          </div>
        ) : visibleStories.length === 0 ? (
          <button
            type="button"
            onClick={() => setManagerOpen(true)}
            className="mx-3 flex w-[calc(100%-1.5rem)] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-200 py-8 text-sm text-neutral-500 transition hover:border-neutral-300 hover:bg-neutral-50 hover:text-neutral-800 sm:mx-0 sm:w-full"
          >
            <i className="fad fa-images text-xl" aria-hidden="true" />
            Thêm Khoảnh khắc đầu tiên
          </button>
        ) : (
          <div className="relative px-3 sm:px-0">
            <div
              ref={emblaRef}
              role="region"
              aria-roledescription="carousel"
              aria-label="Danh sách Khoảnh khắc"
              className="touch-pan-y cursor-grab overflow-hidden select-none active:cursor-grabbing"
            >
              <div className="flex touch-pan-y gap-1.5 will-change-transform">
                {visibleStories.map((story, storyIndex) => {
                  const [cover, ...remainingImages] = story.images;
                  const gallery = `featured-${story.id}`;

                  return (
                    <div
                      key={story.id}
                      role="group"
                      aria-roledescription="slide"
                      aria-label={`${storyIndex + 1} / ${visibleStories.length}`}
                      className="min-w-0 shrink-0"
                      style={{
                        flexBasis: "calc((100% - 0.75rem) / 3)",
                      }}
                    >
                      <a
                        href={cover.secure_url}
                        data-fancybox={gallery}
                        className="group relative block aspect-[9/16] overflow-hidden rounded-xl bg-neutral-100"
                      >
                        <Image
                          src={getFeaturedWidgetImage(cover.secure_url)}
                          alt={`Khoảnh khắc ${storyIndex + 1}`}
                          fill
                          unoptimized
                          sizes="(max-width: 1024px) 33vw, 150px"
                          loading={storyIndex < 3 ? "eager" : "lazy"}
                          draggable={false}
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
            </div>

            {canScrollPrev && (
              <button
                type="button"
                onClick={goPrev}
                title="Khoảnh khắc trước"
                aria-label="Khoảnh khắc trước"
                className="absolute -left-4 top-1/2 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/75 border border-white/50 text-neutral-800 backdrop-blur active:scale-97 sm:opacity-100 opacity-0"
              >
                <i className="fad fa-arrow-left" aria-hidden="true" />
              </button>
            )}

            {canScrollNext && (
              <button
                type="button"
                onClick={goNext}
                title="Khoảnh khắc tiếp theo"
                aria-label="Khoảnh khắc tiếp theo"
                className="absolute -right-4 top-1/2 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/75 border border-white/50 text-neutral-800 backdrop-blur active:scale-97 sm:opacity-100 opacity-0"
              >
                <i className="fad fa-arrow-right" aria-hidden="true" />
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