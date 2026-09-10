"use client";

import { useId, useMemo, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { A11y } from "swiper/modules";
import type { Swiper as SwiperInstance } from "swiper";
import WatchMovieCard from "@/components/watch/WatchMovieCard";
import WatchGrid from "@/components/watch/WatchGrid";
import WatchRowSkeleton from "@/components/watch/WatchRowSkeleton";
import { useWatchCollection } from "@/hooks/watch/useWatchCollection";
import { useWatchRowVisibility } from "@/hooks/watch/useWatchRowVisibility";
import { watchCollectionMovies } from "@/lib/watch/watchCollectionView";
import { WatchApiError, watchApiErrorMessage, type WatchCollectionSource } from "@/types/watchApi";
import "swiper/css";
import styles from "./WatchHomeSlider.module.css";

type Props = { id: string; title: string; description?: string; source: WatchCollectionSource };
type Edges = { beginning: boolean; end: boolean; locked: boolean };

export default function WatchHomeSlider({ id, title, description, source }: Props) {
  const row = useWatchRowVisibility();
  const query = useWatchCollection(source, row.visible);
  const movies = useMemo(() => watchCollectionMovies(query.data?.items ?? []), [query.data]);
  const [expanded, setExpanded] = useState(false);
  const [edges, setEdges] = useState<Edges>({ beginning: true, end: true, locked: true });
  const swiper = useRef<SwiperInstance | null>(null);
  const headingId = useId();
  const contentId = useId();

  function sync(instance: SwiperInstance) {
    const next = { beginning: instance.isBeginning, end: instance.isEnd, locked: instance.isLocked };
    setEdges(old => old.beginning === next.beginning && old.end === next.end && old.locked === next.locked ? old : next);
  }

  function move(direction: "prev" | "next") {
    const instance = swiper.current;
    if (!instance || instance.destroyed) return;
    const speed = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 350;
    if (direction === "prev") instance.slidePrev(speed); else instance.slideNext(speed);
  }

  const error = query.error instanceof WatchApiError && query.error.code === "rate_limited"
    ? watchApiErrorMessage(query.error) : "Nguồn phim tạm thời chưa phản hồi. Bạn có thể thử lại hoặc khám phá mục khác.";

  return <section id={id} ref={row.ref} className={styles.row} aria-labelledby={headingId}
    data-watch-row={id} onFocusCapture={row.activate}>
    <header className={styles.header}>
      <div className={styles.headingGroup}>
        <div className={styles.headingLine}>
          <h2 id={headingId} tabIndex={-1}>{title}</h2>
          {movies.length > 0 && <span className={styles.count}>{movies.length} phim</span>}
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.viewButton} disabled={movies.length === 0}
          aria-expanded={expanded} aria-controls={contentId} onClick={() => setExpanded(value => !value)}>
          <i className={expanded ? "fad fa-rectangle-list" : "fad fa-grid-2"} aria-hidden="true" />
          <span>{expanded ? "Thu gọn" : "Xem dạng lưới"}</span>
        </button>
        {!expanded && <div className={styles.arrows}>
          <button type="button" className={styles.arrow} aria-label={`Phim trước — ${title}`}
            disabled={movies.length < 2 || edges.beginning || edges.locked} onClick={() => move("prev")}>
            <i className="fad fa-chevron-left" aria-hidden="true" />
          </button>
          <button type="button" className={styles.arrow} aria-label={`Phim tiếp theo — ${title}`}
            disabled={movies.length < 2 || edges.end || edges.locked} onClick={() => move("next")}>
            <i className="fad fa-chevron-right" aria-hidden="true" />
          </button>
        </div>}
      </div>
    </header>
    <div id={contentId} aria-busy={row.visible && query.isFetching}>
      {!row.visible || query.isPending ? <WatchRowSkeleton loading={row.visible} />
        : query.isError && !query.data ? <div className={styles.state} role="status">
          <i className="fad fa-cloud-exclamation" aria-hidden="true" />
          <h3>Chưa tải được danh sách</h3><p>{error}</p>
          <button type="button" className={styles.retry} disabled={query.isFetching}
            onClick={() => { if (!query.isFetching) void query.refetch({ cancelRefetch: false }); }}>
            {query.isFetching ? "Đang tải…" : "Thử lại mục này"}
          </button>
        </div> : movies.length === 0 ? <div className={styles.state} role="status">
          <i className="fad fa-film" aria-hidden="true" />
          <h3>Chưa có phim trong mục này</h3><p>Bạn có thể khám phá các bộ sưu tập bên dưới.</p>
        </div> : expanded ? <WatchGrid movies={movies} label={`Phim trong ${title}`} />
        : <Swiper className={styles.track} modules={[A11y]} slidesPerView={2.25} spaceBetween={12}
          slidesPerGroup={1} loop={false} watchOverflow={true} rewind={false}
          breakpoints={{ 480: { slidesPerView: 3.25, spaceBetween: 14 }, 640: { slidesPerView: 4.25, spaceBetween: 16 },
            960: { slidesPerView: 5.25, spaceBetween: 16 }, 1200: { slidesPerView: 6.25, spaceBetween: 16 },
            1536: { slidesPerView: 7.25, spaceBetween: 16 } }}
          a11y={{ enabled: true, containerRoleDescriptionMessage: title,
            itemRoleDescriptionMessage: "Phim", slideLabelMessage: "{{index}} trên {{slidesLength}}" }}
          onSwiper={(instance: SwiperInstance) => { swiper.current = instance; sync(instance); }}
          onSlideChange={sync} onResize={sync} onLock={sync} onUnlock={sync}>
          {movies.map(movie => <SwiperSlide key={movie.slug} className={styles.slide}>
            <WatchMovieCard movie={movie} />
          </SwiperSlide>)}
        </Swiper>}
    </div>
  </section>;
}
