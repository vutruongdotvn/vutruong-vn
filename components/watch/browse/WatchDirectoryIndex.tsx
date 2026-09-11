"use client";

import Link from "next/link";
import WatchProtectedMetadata from "@/components/watch/WatchProtectedMetadata";
import type { CSSProperties } from "react";
import WatchCountryFlag from "@/components/watch/browse/WatchCountryFlag";
import type { WatchDirectoryItem } from "@/lib/watch/watchDirectory";

const CONTAINER_CLASS = [
  "mx-auto w-[min(calc(100%_-_4rem),76rem)] pb-16 pt-28",
  "max-[47.99rem]:w-[calc(100%_-_2.5rem)]",
  "max-[47.99rem]:pb-24 max-[47.99rem]:pt-20",
].join(" ");

const CARD_CLASS = [
  "relative isolate box-border flex h-full min-h-40 flex-col justify-end",
  "gap-[.9rem] overflow-hidden rounded-[1rem_2rem_1rem_1rem]",
  "border-2 border-[color-mix(in_srgb,var(--topic-color)_25%,var(--border))]",
  "bg-[color-mix(in_srgb,var(--topic-color)_23%,var(--card))]",
  "p-[1.35rem] text-foreground no-underline",
  "transition-[box-shadow] duration-200 ease-out",
  "before:absolute before:-top-22 before:-right-12 before:-z-1",
  "before:size-40 before:rounded-full",
  "before:bg-[color-mix(in_srgb,var(--topic-color)_20%,transparent)]",
  "before:content-['']",
  "after:absolute after:-top-28 after:-right-16 after:-z-1",
  "after:size-48 after:rounded-full after:border",
  "after:border-[color-mix(in_srgb,var(--topic-color)_25%,transparent)]",
  "after:content-['']",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_10px_24px_color-mix(in_srgb,var(--foreground)_7%,transparent)]",
  "focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4",
  "max-[63.99rem]:min-h-38",
  "max-[39.99rem]:min-h-33 max-[39.99rem]:gap-[.7rem]",
  "max-[39.99rem]:rounded-[.85rem_1.6rem_.85rem_.85rem]",
  "max-[39.99rem]:p-[1.1rem]",
  "motion-reduce:transition-none",
].join(" ");


function watchDirectoryMetadataTitle(basePath: string, fallbackTitle: string): string {
  if (basePath === "/watch/the-loai") return "Thể loại | Watch";
  if (basePath === "/watch/quoc-gia") return "Quốc gia | Watch";
  if (basePath === "/watch/danh-sach") return "Danh sách | Watch";
  return `${fallbackTitle} | Watch`;
}

export default function WatchDirectoryIndex({
  title,
  description,
  basePath,
  cardAction,
  items,
}: {
  title: string;
  description: string;
  basePath: string;
  cardAction: string;
  items: ReadonlyArray<WatchDirectoryItem>;
}) {
  const metadataTitle = watchDirectoryMetadataTitle(basePath, title);

  return (
    <>
      <WatchProtectedMetadata title={metadataTitle} />
    <main className="min-h-[70vh] bg-background text-foreground" data-watch-directory-index>
      <div className={CONTAINER_CLASS}>
        <header className="mb-8 max-[47.99rem]:mb-6">
          <Link
            href="/watch"
            prefetch={false}
            className="inline-flex min-h-10 items-center gap-2 rounded-full text-sm font-semibold text-muted-foreground no-underline hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-4"
          >
            <i className="fad fa-arrow-left" aria-hidden="true" />
            Quay lại
          </Link>
          {/* <p className="m-0 text-[.68rem] font-bold tracking-[.18em] text-muted-foreground">
            KHÁM PHÁ
          </p> */}
          <h1 className="m-0 text-[clamp(1.7rem,3vw,2rem)] font-black">
            {title}
          </h1>
          {/* <p className="m-0 mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            {description}
          </p> */}
        </header>

        <ul className="m-0 grid list-none grid-cols-5 gap-4 p-0 [&>li]:min-w-0 max-[63.99rem]:grid-cols-3 max-[39.99rem]:grid-cols-2 max-[39.99rem]:gap-3">
          {items.map(item => (
            <li key={item.slug}>
              <Link
                href={`${basePath}/${item.slug}`}
                prefetch={false}
                className={CARD_CLASS}
                style={{ "--topic-color": item.color ?? "hsl(220 35% 58%)" } as CSSProperties}
                aria-label={`${cardAction}: ${item.name}`}
              >
                {item.flag ? (
                  <span className="absolute top-[1.15rem] right-[1.25rem] rotate-[-4deg] opacity-85" aria-hidden="true">
                    <WatchCountryFlag code={item.flag} />
                  </span>
                ) : (
                  <i
                    className={`fad ${item.icon ?? "fa-clapperboard-play"} absolute! top-[1.2rem] right-[1.35rem] -rotate-12 text-[1.7rem] opacity-[.24]`}
                    aria-hidden="true"
                  />
                )}

                <span className="max-w-40 text-[clamp(1rem,1.35vw,1.3rem)] font-[750] leading-[1.3] tracking-[-.02em] max-[39.99rem]:text-[1.1rem]">
                  {item.name}
                </span>
                <span className="flex items-center gap-[.65rem] text-[.7rem] leading-[1.5] text-foreground opacity-70 [&>i]:text-[.65rem] max-[39.99rem]:text-[.65rem]">
                  {cardAction}
                  <i className="fad fa-arrow-right" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
    </>
  );
}
