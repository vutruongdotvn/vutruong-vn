"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { TouchEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { getFeaturedWidgetImage } from "@/lib/cloudinary";
import { fetchFeaturedStories } from "@/lib/featuredStoryService";
import type { FeaturedStory } from "@/types/featuredStory";
import FeaturedManagerModal from "@/components/blog/sidebar/widget/featured/FeaturedManagerModal";

const VISIBLE_STORIES = 3;
const SWIPE_THRESHOLD = 45;

function getSnapPositions(storyCount: number) {
  if (storyCount <= VISIBLE_STORIES) return [0];

  const lastStart = storyCount - VISIBLE_STORIES;
  const positions = [0];

  for (
    let position = VISIBLE_STORIES;
    position < lastStart;
    position += VISIBLE_STORIES
  ) {
    positions.push(position);
  }

  if (positions[positions.length - 1] !== lastStart) {
    positions.push(lastStart);
  }

  return positions;
}

export default function FeaturedWidget() {
  const { role, status } = useUser();
  const isAdmin = role === "admin" && status === "approved";

  const [stories, setStories] = useState<FeaturedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [page, setPage] = useState(0);
  const [slideUnit, setSlideUnit] = useState(0);
  const [managerOpen, setManagerOpen] = useState(false);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const reloadTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resizeFrameRef = useRef<number | null>(null);

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

  const snapPositions = useMemo(
    () => getSnapPositions(visibleStories.length),
    [visibleStories.length]
  );
  const pageCount = snapPositions.length;
  const startIndex = snapPositions[page] ?? 0;

  useEffect(() => {
    setPage((current) => Math.min(current, Math.max(pageCount - 1, 0)));
  }, [pageCount]);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;

    if (!viewport || !track || visibleStories.length === 0) {
      setSlideUnit(0);
      return;
    }

    const updateSlideUnit = () => {
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
      }

      resizeFrameRef.current = requestAnimationFrame(() => {
        const firstCard = track.firstElementChild as HTMLElement | null;
        if (!firstCard) return;

        const trackStyle = window.getComputedStyle(track);
        const columnGap = Number.parseFloat(trackStyle.columnGap);
        const fallbackGap = Number.parseFloat(trackStyle.gap);
        const gap = Number.isFinite(columnGap)
          ? columnGap
          : Number.isFinite(fallbackGap)
            ? fallbackGap
            : 0;
        const nextUnit = firstCard.getBoundingClientRect().width + gap;

        setSlideUnit((current) =>
          Math.abs(current - nextUnit) < 0.5 ? current : nextUnit
        );
      });
    };

    updateSlideUnit();

    const resizeObserver = new ResizeObserver(updateSlideUnit);
    resizeObserver.observe(viewport);

    return () => {
      resizeObserver.disconnect();
      if (resizeFrameRef.current !== null) {
        cancelAnimationFrame(resizeFrameRef.current);
        resizeFrameRef.current = null;
      }
    };
  }, [visibleStories.length]);

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
            Khoảnh khắc
          </h3>

          {isAdmin && (
            <button
              type="button"
              onClick={() => setManagerOpen(true)}
              title="Quản lý Tin nổi bật"
              aria-label="Quản lý Tin nổi bật"
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
              ref={viewportRef}
              className="touch-pan-y overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onTouchCancel={() => {
                touchStartXRef.current = null;
              }}
            >
              <div
                ref={trackRef}
                className="flex gap-1.5 will-change-transform transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none"
                style={{
                  transform: `translate3d(-${startIndex * slideUnit}px, 0, 0)`,
                  backfaceVisibility: "hidden",
                }}
              >
                {visibleStories.map((story, storyIndex) => {
                  const [cover, ...remainingImages] = story.images;
                  const gallery = `featured-${story.id}`;

                  return (
                    <div
                      key={story.id}
                      className="min-w-0 shrink-0"
                      style={{
                        flexBasis: "calc((100% - 0.75rem) / 3)",
                      }}
                    >
                      <a
                        href={cover.secure_url}
                        data-fancybox={gallery}
                        className="group relative block aspect-[2/3] overflow-hidden rounded-xl bg-neutral-100"
                        title="Bấm để xem Tin nổi bật"
                      >
                        <Image
                          src={getFeaturedWidgetImage(cover.secure_url)}
                          alt={`Tin nổi bật ${storyIndex + 1}`}
                          fill
                          unoptimized
                          sizes="(max-width: 1024px) 33vw, 150px"
                          loading={storyIndex < 3 ? "eager" : "lazy"}
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

            {page > 0 && (
              <button
                type="button"
                onClick={goPrev}
                title="Tin nổi bật trước"
                aria-label="Tin nổi bật trước"
                className="absolute -left-4 top-1/2 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/75 border border-white/50 text-neutral-800 backdrop-blur active:scale-97"
              >
                <i className="fad fa-arrow-left" aria-hidden="true" />
              </button>
            )}

            {page < pageCount - 1 && (
              <button
                type="button"
                onClick={goNext}
                title="Tin nổi bật tiếp theo"
                aria-label="Tin nổi bật tiếp theo"
                className="absolute -right-4 top-1/2 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/75 border border-white/50 text-neutral-800 backdrop-blur active:scale-97"
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