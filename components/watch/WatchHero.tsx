"use client";

import { useQueries } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y, EffectFade } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import { useWatchQueryScope } from "@/components/watch/WatchQueryProvider";
import WatchRemoteImage from "@/components/watch/WatchRemoteImage";
import { selectWatchHeroSlugs, WATCH_HERO_SLUGS } from "@/lib/watch/watchHeroConfig";
import { WatchApiError, watchApiErrorMessage } from "@/types/watchApi";
import "swiper/css";
import "swiper/css/effect-fade";
import styles from "./WatchHero.module.css";

const SLUGS = selectWatchHeroSlugs(WATCH_HERO_SLUGS);

function heroErrorMessage(error: unknown): string {
  if (error instanceof WatchApiError) {
    if (error.code === "rate_limited") return watchApiErrorMessage(error);
    if (error.code === "http_error" && error.details.status === 404) return "Nguồn hiện chưa có phim này. Bạn có thể chọn phim khác.";
  }
  return "Chưa tải được thông tin phim. Bạn có thể thử lại hoặc chọn phim khác.";
}

/** One finite set of detail queries. Navigation only changes the Swiper index.
 * This component is mounted exclusively under A2 Guard + B2 QueryProvider.
 */
export default function WatchHero() {
  const scope = useWatchQueryScope();
  const queries = useQueries({ queries: SLUGS.map(slug => ({
    ...scope.detailOptions(slug), enabled: scope.getSnapshot().ready,
  })) });
  const [index, setIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(true);
  const swiper = useRef<SwiperInstance | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const thumbList = useRef<HTMLDivElement>(null);
  const headingId = useId();
  const dialogHeadingId = useId();
  const active = queries[index]?.data;

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update(); media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const list = thumbList.current;
    const button = list?.children[index] as HTMLButtonElement | undefined;
    if (list && button) list.scrollTo({
      left: button.offsetLeft - list.offsetLeft - (list.clientWidth - button.offsetWidth) / 2,
      behavior: reducedMotion ? "instant" : "smooth",
    });
  }, [index, reducedMotion]);

  function goTo(next: number) {
    if (swiper.current && !swiper.current.destroyed && SLUGS.length > 1) {
      swiper.current.slideTo((next + SLUGS.length) % SLUGS.length);
    }
  }

  if (SLUGS.length === 0) return <section className={styles.empty}>
    <h1>Phim nổi bật</h1><p>Chưa có phim trong bộ sưu tập này.</p>
  </section>;

  return (
    <section className={styles.hero} aria-labelledby={headingId} data-watch-hero>
      <h1 id={headingId} className={styles.srOnly}>Phim nổi bật trên VT Zone Watch</h1>
      <Swiper className={styles.swiper} modules={[A11y, EffectFade]} effect="fade"
        fadeEffect={{ crossFade: true }} slidesPerView={1} loop={false} rewind={false}
        speed={reducedMotion ? 0 : 550} allowTouchMove={SLUGS.length > 1}
        a11y={{ enabled: true, containerRoleDescriptionMessage: "Bộ sưu tập phim nổi bật",
          itemRoleDescriptionMessage: "Phim", slideLabelMessage: "{{index}} trên {{slidesLength}}" }}
        onSwiper={(instance: SwiperInstance) => { swiper.current = instance; }}
        onSlideChange={(instance: SwiperInstance) => { dialog.current?.close(); setIndex(instance.activeIndex); }}>
        {SLUGS.map((slug, position) => {
          const query = queries[position];
          const movie = query.data;
          return <SwiperSlide key={slug}>
            <article className={styles.slide} aria-hidden={index !== position} inert={index !== position}>
              <div className={styles.art} aria-hidden="true">
                {movie?.posterUrl && <WatchRemoteImage src={movie.posterUrl}
                  className={styles.backdrop} priority={position === 0} />}
              </div>
              <div className={styles.wash} aria-hidden="true" />
              <div className={styles.content}>
                <div className={styles.copy}>
                  <p className={styles.eyebrow}><span className={styles.mark} aria-hidden="true" /> WATCH · PHIM NỔI BẬT</p>
                  {movie ? <>
                    <h2 className={styles.title}>{movie.name}</h2>
                    {movie.originalName && <p className={styles.original}>{movie.originalName}</p>}
                    <div className={styles.meta}>
                      {[movie.quality, movie.language, movie.year, movie.duration, movie.currentEpisode]
                        .filter((value): value is string => !!value).map((value, i) => <span key={`${i}-${value}`}>{value}</span>)}
                    </div>
                    {(movie.genres.length > 0 || movie.countries.length > 0) && <p className={styles.taxonomy}>
                      {[...movie.genres.slice(0, 3), ...movie.countries.slice(0, 1)].join(" · ")}
                    </p>}
                    {movie.description && <p className={styles.description}>{movie.description}</p>}
                    <button type="button" className={styles.infoButton} onClick={() => dialog.current?.showModal()}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                        <circle cx="12" cy="12" r="9" /><path d="M12 11v6m0-10v1" />
                      </svg>
                      Thông tin phim
                    </button>
                  </> : query.isError ? <div className={styles.message} role={index === position ? "status" : undefined}>
                    <h2>Chưa tải được phim này</h2>
                    <p>{heroErrorMessage(query.error)}</p>
                    <button type="button" className={styles.infoButton} disabled={query.isFetching}
                      onClick={() => { if (!query.isFetching) void query.refetch({ cancelRefetch: false }); }}>
                      {query.isFetching ? "Đang tải" : "Thử lại phim này"}
                    </button>
                  </div> : <div className={styles.skeleton} role={index === position ? "status" : undefined}>
                    <span className={styles.srOnly}>Đang tải phim nổi bật</span>
                    <span /><span /><span />
                  </div>}
                </div>
              </div>
            </article>
          </SwiperSlide>;
        })}
      </Swiper>

      <div className={styles.bottom}>
        <div className={styles.navigation}>
          <button type="button" className={styles.arrow} aria-label="Phim trước" disabled={SLUGS.length < 2}
            onClick={() => goTo(index - 1)}><span aria-hidden="true">←</span></button>
          <span className={styles.counter} aria-live="polite" aria-atomic="true">
            <strong>{String(index + 1).padStart(2, "0")}</strong><span> / {String(SLUGS.length).padStart(2, "0")}</span>
          </span>
          <button type="button" className={styles.arrow} aria-label="Phim tiếp theo" disabled={SLUGS.length < 2}
            onClick={() => goTo(index + 1)}><span aria-hidden="true">→</span></button>
        </div>
        <div className={styles.thumbnails} ref={thumbList} role="group" aria-label="Chọn phim nổi bật">
          {SLUGS.map((slug, position) => <button type="button" key={slug} className={styles.thumbnail}
            aria-label={queries[position].data ? `Chọn ${queries[position].data!.name}` : `Chọn phim ${position + 1}`}
            aria-pressed={index === position} title={queries[position].data?.name}
            onClick={() => goTo(position)} onKeyDown={event => {
              if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
              event.preventDefault();
              const next = (position + (event.key === "ArrowRight" ? 1 : -1) + SLUGS.length) % SLUGS.length;
              goTo(next); (thumbList.current?.children[next] as HTMLButtonElement | undefined)?.focus();
            }}>
            {queries[position].data?.posterUrl && <WatchRemoteImage src={queries[position].data!.posterUrl}
              className={styles.thumbImage} />}
            <span className={styles.thumbNumber}>{String(position + 1).padStart(2, "0")}</span>
          </button>)}
        </div>
      </div>

      <dialog ref={dialog} className={styles.dialog} aria-labelledby={dialogHeadingId}
        onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>
        <div className={styles.dialogContent}>
          <div className={styles.dialogTop}>
            <p className={styles.eyebrow}>THÔNG TIN PHIM</p>
            <button type="button" className={styles.arrow} autoFocus aria-label="Đóng thông tin phim"
              onClick={() => dialog.current?.close()}>×</button>
          </div>
          <h2 id={dialogHeadingId}>{active?.name ?? "Thông tin phim"}</h2>
          {active?.originalName && <p className={styles.original}>{active.originalName}</p>}
          <p className={styles.fullDescription}>{active?.description ?? "Nguồn chưa cung cấp mô tả cho phim này."}</p>
          <dl className={styles.credits}>
            {active?.director && <div><dt>Đạo diễn</dt><dd>{active.director}</dd></div>}
            {active?.casts && <div><dt>Diễn viên</dt><dd>{active.casts}</dd></div>}
          </dl>
        </div>
      </dialog>
    </section>
  );
}
