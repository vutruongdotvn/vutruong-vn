"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";

/*
 * Chỉ import CSS cốt lõi để giữ bundle gọn.
 * Không dùng FreeMode: story phải luôn bám vào một snap point cố định.
 * Không import Mousewheel: con lăn/trackpad không điều khiển slider.
 */
import "swiper/css";

import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import {
  getFeaturedWidgetImage,
  getFeaturedWidgetLightboxImage,
} from "@/lib/cloudinary";
import { fetchFeaturedStories } from "@/lib/featuredStoryService";
import type { FeaturedStory } from "@/types/featuredStory";
import FeaturedManagerModal from "@/components/blog/sidebar/widget/featured/FeaturedManagerModal";

const VISIBLE_STORIES = 3;

/*
 * THỜI GIAN HÚT VỀ SNAP POINT (milliseconds):
 * - 300–400: nhanh và dứt khoát.
 * - 450: cân bằng, đang dùng.
 * - 500–600: chậm và mềm hơn.
 */
const SNAP_SPEED = 450;

/*
 * NGƯỠNG VÀ RESISTANCE THEO LOẠI INPUT:
 * - Touch phản hồi sớm hơn và có mép mềm hơn để gần cảm giác vuốt trên iOS.
 * - Chuột có ngưỡng cao hơn và mép chắc hơn để dễ kiểm soát trên PC.
 * - resistanceRatio càng gần 1 thì càng kéo vượt mép nhiều.
 */
const POINTER_THRESHOLD = 5;
const TOUCH_THRESHOLD = 2;
const POINTER_RESISTANCE_RATIO = 0.4;
const TOUCH_RESISTANCE_RATIO = 0.85;

export default function FeaturedWidget() {
  const { role, status } = useUser();
  const isAdmin = role === "admin" && status === "approved";

  const [stories, setStories] = useState<FeaturedStory[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
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

  if (!loading && visibleStories.length === 0 && !isAdmin) return null;

  return (
    <>
      <section className="rounded-none bg-card p-3 px-0 sm:rounded-2xl sm:p-4">
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
              className="flex cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:text-foreground active:scale-97"
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
                className="aspect-[2/3] animate-pulse rounded-xl bg-muted"
              />
            ))}
          </div>
        ) : loadError ? (
          <div className="px-4 py-7 text-center text-sm text-muted-foreground sm:px-0">
            Chưa thể tải Khoảnh khắc.
          </div>
        ) : visibleStories.length === 0 ? (
          <button
            type="button"
            onClick={() => setManagerOpen(true)}
            className="mx-3 flex w-[calc(100%-1.5rem)] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-8 text-sm text-muted-foreground transition hover:border-border hover:bg-muted/50 hover:text-foreground sm:mx-0 sm:w-full"
          >
            <i className="fad fa-images text-xl" aria-hidden="true" />
            Thêm Khoảnh khắc đầu tiên
          </button>
        ) : (
          <div className="px-3 sm:px-0">
            <Swiper
              onTouchStart={(swiper, event) => {
                const isTouchInput =
                  ("pointerType" in event &&
                    event.pointerType !== "mouse") ||
                  event.type.startsWith("touch");

                swiper.params.threshold = isTouchInput
                  ? TOUCH_THRESHOLD
                  : POINTER_THRESHOLD;
                swiper.params.resistanceRatio = isTouchInput
                  ? TOUCH_RESISTANCE_RATIO
                  : POINTER_RESISTANCE_RATIO;
              }}
              /*
               * LAYOUT VÀ SNAP POINT:
               * - slidesPerView={3}: luôn hiển thị đúng 3 story như giao diện cũ.
               * - slidesPerGroup={1}: mỗi điểm dừng dịch đúng 1 story.
               * - spaceBetween={6}: tương đương gap-1.5 (6 px) trước đây.
               * - speed={450}: thời gian hút và bám vào cạnh story gần nhất.
               */
              slidesPerView={VISIBLE_STORIES}
              slidesPerGroup={1}
              spaceBetween={6}
              speed={SNAP_SPEED}
              /*
               * TƯƠNG TÁC:
               * - grabCursor: con trỏ bàn tay trên PC.
               * - simulateTouch: cho phép click-giữ chuột trái để kéo.
               * - followFinger: story di chuyển trực tiếp theo ngón tay/con trỏ.
               * - watchOverflow: tự khóa nếu có không quá 3 story.
               * - preventClicks*: không mở Fancybox nhầm sau một thao tác kéo.
               * - shortSwipes: vuốt nhanh vẫn chuyển sang story kế tiếp.
               * - longSwipesRatio={0.5}: kéo qua 50% thì sang story kế tiếp;
               *   chưa tới 50% thì quay về story gần nhất.
               */
              grabCursor
              simulateTouch
              followFinger
              threshold={POINTER_THRESHOLD}
              touchRatio={1}
              touchAngle={45}
              watchOverflow
              resistance
              resistanceRatio={POINTER_RESISTANCE_RATIO}
              preventClicks
              preventClicksPropagation
              shortSwipes
              longSwipes
              longSwipesMs={300}
              longSwipesRatio={0.5}
              className="w-full min-w-0 max-w-full touch-pan-y select-none"
            >
              {visibleStories.map((story, storyIndex) => {
                const [cover, ...remainingImages] = story.images;
                const gallery = `featured-${story.id}`;

                return (
                  <SwiperSlide
                    key={story.id}
                    className="!h-auto min-w-0"
                  >
                    <a
                      href={getFeaturedWidgetLightboxImage(cover.secure_url)}
                      data-fancybox={gallery}
                      draggable={false}
                      className="group relative block aspect-[2/3] overflow-hidden rounded-xl bg-muted"
                    >
                      <Image
                        src={getFeaturedWidgetImage(cover.secure_url)}
                        alt={`Khoảnh khắc ${storyIndex + 1}`}
                        fill
                        unoptimized
                        draggable={false}
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
                            href={getFeaturedWidgetLightboxImage(
                              image.secure_url
                            )}
                            data-fancybox={gallery}
                            aria-hidden="true"
                            tabIndex={-1}
                          />
                        ))}
                      </div>
                    )}
                  </SwiperSlide>
                );
              })}
            </Swiper>
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
