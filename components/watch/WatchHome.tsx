"use client";

import WatchHero from "@/components/watch/WatchHero";
import WatchSlider from "@/components/watch/WatchSlider";
import WatchTopic from "@/components/watch/WatchTopic";
import { WATCH_HOME_ROWS } from "@/lib/watch/watchHomeConfig";

const HOME_CONTAINER_CLASS = [
  "mx-auto w-[min(calc(100%_-_4rem),72rem)] md:pb-4 pb-23",
  "max-[47.99rem]:w-[calc(100%_-_2.5rem)]",
  "max-[47.99rem]:pt-6 max-[47.99rem]:pb-24",
].join(" ");

const FOOTER_CLASS = [
  "mt-16 flex items-center justify-center gap-6",
  "border-t border-border pt-7 text-xs text-muted-foreground",
  "[&_p]:m-0 [&_p]:inline-flex [&_p]:items-center",
  "[&_p]:gap-[.65rem] [&_p]:font-semibold",
  "[&_a]:m-0 [&_a]:inline-flex [&_a]:min-h-10 [&_a]:items-center",
  "[&_a]:gap-[.65rem] [&_a]:text-inherit [&_a]:no-underline",
  "[&_a:hover]:text-foreground",
  "[&_a:focus-visible]:rounded-sm [&_a:focus-visible]:outline-2",
  "[&_a:focus-visible]:outline-ring [&_a:focus-visible]:outline-offset-4",
  "max-[47.99rem]:mt-12 max-[47.99rem]:pt-5 max-[47.99rem]:text-[.7rem]",
].join(" ");

/** Authorization and identity-scoped RAM cache are owned by app/watch/layout.tsx. */
export default function WatchHome() {
  return (
    <main
      id="watch-top"
      className="relative w-full scroll-mt-20 bg-background text-foreground pt-14"
      data-watch-home
    >
      <a
        className="absolute top-4 left-5 z-5 h-px w-px overflow-hidden whitespace-nowrap [clip-path:inset(50%)] focus:h-auto focus:w-auto focus:rounded-full focus:bg-primary focus:px-[1.2rem] focus:py-[.8rem] focus:text-primary-foreground focus:[clip-path:none] focus:outline-2 focus:outline-ring focus:outline-offset-4"
        href="#watch-latest"
      >
        Đến danh sách phim
      </a>

      <WatchHero />

      <div className={HOME_CONTAINER_CLASS}>
        <WatchTopic />

        <div className="mt-15 flex flex-col gap-15 max-[47.99rem]:mt-11 max-[47.99rem]:gap-11">
          {WATCH_HOME_ROWS.map(row => (
            <WatchSlider key={row.id} {...row} />
          ))}
        </div>

        <footer className={FOOTER_CLASS}>
          <p>
            VT Watch
          </p>
        </footer>
      </div>
    </main>
  );
}
