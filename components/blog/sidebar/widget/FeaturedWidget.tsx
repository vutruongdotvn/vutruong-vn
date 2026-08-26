"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Swiper as SwiperInstance } from "swiper";
import { FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

/*
 * Chỉ import CSS cốt lõi và FreeMode để giữ bundle gọn.
 * Không import Mousewheel: con lăn/trackpad không điều khiển slider.
 */
import "swiper/css";
import "swiper/css/free-mode";

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
 * THỜI GIAN CHUYỂN SLIDE KHI BẤM NÚT MŨI TÊN (milliseconds):
 * - 350–450: nhanh, gọn.
 * - 500–600: cân bằng, đang dùng 550.
 * - 700–900: chậm và mềm hơn.
 * Giá trị này không ảnh hưởng quán tính khi kéo/vuốt trực tiếp.
 */
const NAVIGATION_SPEED = 750;

/*
 * PHYSICS TƯƠNG TÁC — đồng bộ với PostImages final:
 *
 * POINTER_PHYSICS áp dụng cho click-giữ chuột trái trên PC.
 * TOUCH_PHYSICS chỉ áp dụng cho touch/pen trên mobile/tablet.
 *
 * - threshold: quãng kéo tối thiểu trước khi slider bắt đầu di chuyển.
 * - resistanceRatio: độ mềm khi kéo quá mép; gần 1 = kéo vượt mép nhiều hơn.
 * - momentumBounceRatio: cường độ nảy trở lại ở đầu/cuối.
 * - momentumRatio: quãng đường tiếp tục trượt sau khi thả.
 * - momentumVelocityRatio: vận tốc quán tính sau khi thả.
 * - minimumVelocity: vận tốc tối thiểu để kích hoạt quán tính.
 */
const POINTER_PHYSICS = {
  threshold: 5,
  resistanceRatio: 0.4,
  momentumBounceRatio: 0.3,
  momentumRatio: 0.3,
  momentumVelocityRatio: 0.3,
  minimumVelocity: 0,
};

const TOUCH_PHYSICS = {
  threshold: 2,
  resistanceRatio: 0.85,
  momentumBounceRatio: 0.85,
  momentumRatio: 1,
  momentumVelocityRatio: 1,
  minimumVelocity: 0.02,
};

const SWIPER_MODULES = [FreeMode];

function applyInteractionPhysics(
  swiper: SwiperInstance,
  isTouchInput: boolean
) {
  const physics = isTouchInput ? TOUCH_PHYSICS : POINTER_PHYSICS;

  swiper.params.threshold = physics.threshold;
  swiper.params.resistanceRatio = physics.resistanceRatio;

  if (
    swiper.params.freeMode &&
    typeof swiper.params.freeMode === "object"
  ) {
    Object.assign(swiper.params.freeMode, {
      momentumBounceRatio: physics.momentumBounceRatio,
      momentumRatio: physics.momentumRatio,
      momentumVelocityRatio: physics.momentumVelocityRatio,
      minimumVelocity: physics.minimumVelocity,
    });
  }
}

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
  const [canSlidePrev, setCanSlidePrev] = useState(false);
  const [canSlideNext, setCanSlideNext] = useState(false);
  const [managerOpen, setManagerOpen] = useState(false);
  const swiperRef = useRef<SwiperInstance | null>(null);
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

  const snapPositions = useMemo(
    () => getSnapPositions(visibleStories.length),
    [visibleStories.length]
  );

  const syncNavigationState = useCallback(
    (swiper: SwiperInstance) => {
      const hasOverflow = visibleStories.length > VISIBLE_STORIES;
      const nextCanSlidePrev = hasOverflow && !swiper.isBeginning;
      const nextCanSlideNext = hasOverflow && !swiper.isEnd;

      setCanSlidePrev((current) =>
        current === nextCanSlidePrev ? current : nextCanSlidePrev
      );
      setCanSlideNext((current) =>
        current === nextCanSlideNext ? current : nextCanSlideNext
      );
    },
    [visibleStories.length]
  );

  /*
   * Khi realtime thêm/xóa story, cập nhật Swiper và bảo đảm activeIndex không
   * vượt quá vị trí cuối cùng vẫn hiển thị đủ 3 story.
   */
  useEffect(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    const frame = requestAnimationFrame(() => {
      swiper.update();

      const lastStart = Math.max(
        visibleStories.length - VISIBLE_STORIES,
        0
      );

      if (swiper.activeIndex > lastStart) {
        swiper.slideTo(lastStart, 0);
      }

      syncNavigationState(swiper);
    });

    return () => cancelAnimationFrame(frame);
  }, [syncNavigationState, visibleStories.length]);

  /*
   * Nút mũi tên vẫn dùng các mốc trang cũ:
   * - 4 story: 0 → 1.
   * - 5 story: 0 → 2.
   * - 6 story: 0 → 3.
   * - 7 story: 0 → 3 → 4.
   * Nhờ vậy trang cuối không bao giờ có cột trống.
   */
  const goPrev = useCallback(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    let target = 0;

    for (const position of snapPositions) {
      if (position >= swiper.activeIndex) break;
      target = position;
    }

    swiper.slideTo(target, NAVIGATION_SPEED);
  }, [snapPositions]);

  const goNext = useCallback(() => {
    const swiper = swiperRef.current;
    if (!swiper) return;

    const target =
      snapPositions.find((position) => position > swiper.activeIndex) ??
      snapPositions[snapPositions.length - 1] ??
      0;

    swiper.slideTo(target, NAVIGATION_SPEED);
  }, [snapPositions]);

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
                className="aspect-[2/3] animate-pulse rounded-xl bg-neutral-100"
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
            <Swiper
              modules={SWIPER_MODULES}
              onSwiper={(swiper) => {
                swiperRef.current = swiper;
                syncNavigationState(swiper);
              }}
              onBeforeDestroy={(swiper) => {
                if (swiperRef.current === swiper) {
                  swiperRef.current = null;
                }
              }}
              onTouchStart={(swiper, event) => {
                const isTouchInput =
                  ("pointerType" in event &&
                    event.pointerType !== "mouse") ||
                  event.type.startsWith("touch");

                applyInteractionPhysics(swiper, isTouchInput);
              }}
              /*
               * Chỉ cập nhật trạng thái nút ở các sự kiện cần thiết, không gọi
               * setState liên tục trên từng frame khi đang kéo/vuốt.
               */
              onReachBeginning={syncNavigationState}
              onReachEnd={syncNavigationState}
              onFromEdge={syncNavigationState}
              onSlideChange={syncNavigationState}
              onResize={syncNavigationState}
              /*
               * LAYOUT:
               * - slidesPerView={3}: luôn hiển thị đúng 3 story như giao diện cũ.
               * - spaceBetween={6}: tương đương gap-1.5 (6 px) trước đây.
               * Có thể đổi hai giá trị này nếu muốn thay số lượng/khoảng cách.
               */
              slidesPerView={VISIBLE_STORIES}
              spaceBetween={6}
              /*
               * TƯƠNG TÁC:
               * - grabCursor: con trỏ bàn tay trên PC.
               * - simulateTouch: cho phép click-giữ chuột trái để kéo.
               * - watchOverflow={false}: vẫn giữ resistance/nảy ở hai mép.
               * - preventClicks*: không mở Fancybox nhầm sau một thao tác kéo.
               */
              grabCursor
              simulateTouch
              threshold={POINTER_PHYSICS.threshold}
              watchOverflow={false}
              resistance
              resistanceRatio={POINTER_PHYSICS.resistanceRatio}
              preventClicks
              preventClicksPropagation
              freeMode={{
                // Bật cuộn tự do thay vì bắt buộc dừng đúng từng story.
                enabled: false,
                // Tiếp tục trượt theo quán tính sau khi thả tay/chuột.
                momentum: true,
                // Cho phép nảy trở lại khi trượt quá đầu/cuối.
                momentumBounce: true,
                momentumBounceRatio:
                  POINTER_PHYSICS.momentumBounceRatio,
                // Tăng để trượt xa hơn; giảm để dừng sớm hơn.
                momentumRatio: POINTER_PHYSICS.momentumRatio,
                // Tăng để quán tính nhanh hơn; giảm để chuyển động chậm hơn.
                momentumVelocityRatio:
                  POINTER_PHYSICS.momentumVelocityRatio,
                // Tăng nếu slider tạo quán tính từ những chuyển động quá nhỏ.
                minimumVelocity: POINTER_PHYSICS.minimumVelocity,
                // false = dừng tự do; true = hút về story gần nhất.
                sticky: true,
              }}
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
                      className="group relative block aspect-[2/3] overflow-hidden rounded-xl bg-neutral-100"
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

            {canSlidePrev && (
              <button
                type="button"
                onClick={goPrev}
                title="Khoảnh khắc trước"
                aria-label="Khoảnh khắc trước"
                className="pointer-events-none absolute -left-4 top-1/2 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/50 bg-white/75 text-neutral-800 opacity-0 backdrop-blur active:scale-97 sm:pointer-events-auto sm:opacity-100"
              >
                <i className="fad fa-arrow-left" aria-hidden="true" />
              </button>
            )}

            {canSlideNext && (
              <button
                type="button"
                onClick={goNext}
                title="Khoảnh khắc tiếp theo"
                aria-label="Khoảnh khắc tiếp theo"
                className="pointer-events-none absolute -right-4 top-1/2 z-10 flex size-8 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full border border-white/50 bg-white/75 text-neutral-800 opacity-0 backdrop-blur active:scale-97 sm:pointer-events-auto sm:opacity-100"
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