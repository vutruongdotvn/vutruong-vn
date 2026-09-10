"use client";

import { useId, useState } from "react";
import { WATCH_TOPICS, WATCH_TOPIC_INITIAL_COUNT } from "@/lib/watch/watchHomeConfig";

// Chỉnh màu từng chủ đề tại đây; card dùng CSS variable qua Tailwind arbitrary property.
const TOPIC_TONES = {
  pink: "[--topic-color:#d775c8]",
  sage: "[--topic-color:#72a37c]",
  copper: "[--topic-color:#be895e]",
  rose: "[--topic-color:#d66f91]",
  teal: "[--topic-color:#54a99b]",
  violet: "[--topic-color:#9a81c9]",
  blue: "[--topic-color:#679bc2]",
  gold: "[--topic-color:#c4a75a]",
} as const;

const TOPIC_CARD_CLASS = [
  "relative isolate box-border flex h-full min-h-40 flex-col justify-end",
  "gap-[.9rem] overflow-hidden rounded-[1rem_2rem_1rem_1rem]",
  "border border-[color-mix(in_srgb,var(--topic-color)_25%,var(--border))]",
  "bg-[color-mix(in_srgb,var(--topic-color)_23%,var(--card))]",
  "p-[1.35rem] text-foreground no-underline",
  "transition-[transform,box-shadow] duration-200 ease-out",
  "before:absolute before:-top-22 before:-right-12 before:-z-1",
  "before:size-40 before:rounded-full",
  "before:bg-[color-mix(in_srgb,var(--topic-color)_20%,transparent)]",
  "before:content-['']",
  "after:absolute after:-top-28 after:-right-16 after:-z-1",
  "after:size-48 after:rounded-full after:border",
  "after:border-[color-mix(in_srgb,var(--topic-color)_25%,transparent)]",
  "after:content-['']",
  // "[@media(hover:hover)_and_(pointer:fine)]:hover:-translate-y-1",
  "[@media(hover:hover)_and_(pointer:fine)]:hover:shadow-[0_10px_24px_color-mix(in_srgb,var(--foreground)_7%,transparent)]",
  "max-[63.99rem]:min-h-38",
  "max-[39.99rem]:min-h-33 max-[39.99rem]:gap-[.7rem]",
  "max-[39.99rem]:rounded-[.85rem_1.6rem_.85rem_.85rem]",
  "max-[39.99rem]:p-[1.1rem]",
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0",
].join(" ");

const TOPIC_SECTION_CLASS = [
  "min-w-0",
  "[&_a:focus-visible]:outline-2 [&_a:focus-visible]:outline-ring",
  "[&_a:focus-visible]:outline-offset-4",
  "[&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-ring",
  "[&_button:focus-visible]:outline-offset-4",
].join(" ");

/** Local navigation only. Fetching belongs to the protected destination row. */
export default function WatchTopic() {
  const [expanded, setExpanded] = useState(false);
  const headingId = useId();
  const listId = useId();
  const topics = expanded
    ? WATCH_TOPICS
    : WATCH_TOPICS.slice(0, WATCH_TOPIC_INITIAL_COUNT);
  const remaining = Math.max(0, WATCH_TOPICS.length - WATCH_TOPIC_INITIAL_COUNT);

  return (
    <section
      className={TOPIC_SECTION_CLASS}
      aria-labelledby={headingId}
      data-watch-topics
    >
      <header className="mb-6 flex items-end justify-between gap-4 max-[39.99rem]:mb-[1.1rem] max-[39.99rem]:items-start max-[39.99rem]:gap-3 [&_h2]:m-0 [&_h2]:text-[clamp(1.4rem,2vw,1.9rem)] [&_h2]:font-[750] [&_h2]:leading-[1.3] [&_h2]:tracking-[-.03em] [&_h2]:text-foreground max-[39.99rem]:[&_h2]:text-[1.35rem]">
        <div>
          <h2 id={headingId}>Bạn đang quan tâm gì?</h2>
        </div>

        {remaining > 0 && (
          <button
            type="button"
            className="inline-flex min-h-10 cursor-pointer items-center gap-[.7rem] rounded-full border border-border bg-card px-[.8rem] py-[.45rem] text-xs whitespace-nowrap text-muted-foreground hover:bg-accent hover:text-foreground max-[39.99rem]:min-h-[2.2rem] max-[39.99rem]:gap-[.4rem] max-[39.99rem]:px-[.6rem] max-[39.99rem]:py-[.4rem] max-[39.99rem]:text-[.65rem]"
            aria-controls={listId}
            aria-expanded={expanded}
            onClick={() => setExpanded(value => !value)}
          >
            <span>{expanded ? "Thu gọn" : `+${remaining} chủ đề`}</span>
            <i
              className={`fad ${expanded ? "fa-minus" : "fa-plus"}`}
              aria-hidden="true"
            />
          </button>
        )}
      </header>

      <ul
        id={listId}
        className="m-0 grid list-none grid-cols-5 gap-4 p-0 [&>li]:min-w-0 max-[63.99rem]:grid-cols-3 max-[39.99rem]:grid-cols-2 max-[39.99rem]:gap-3 max-[39.99rem]:data-[expanded=false]:[&>li:last-child]:col-span-full"
        data-expanded={expanded}
      >
        {topics.map(topic => (
          <li key={topic.target}>
            <a
              href={`#${topic.target}`}
              className={`${TOPIC_CARD_CLASS} ${TOPIC_TONES[topic.tone]}`}
              onClick={event => {
                if (
                  event.metaKey
                  || event.ctrlKey
                  || event.shiftKey
                  || event.altKey
                  || event.button !== 0
                ) {
                  return;
                }

                // Native hash navigation scrolls; focus activates a lazy row for keyboard users.
                window.document
                  .getElementById(topic.target)
                  ?.querySelector<HTMLElement>("h2")
                  ?.focus({ preventScroll: true });
              }}
            >
              <i
                className={`fad ${topic.icon} absolute! top-[1.2rem] right-[1.35rem] -rotate-12 text-[1.7rem] opacity-[.24]`}
                aria-hidden="true"
              />
              <span className="max-w-36 text-[clamp(1rem,1.35vw,1.3rem)] font-[750] leading-[1.3] tracking-[-.02em] max-[39.99rem]:text-[1.1rem]">
                {topic.title}
              </span>
              <span className="flex items-center gap-[.65rem] text-[.7rem] leading-[1.5] text-foreground opacity-70 [&>i]:text-[.65rem] max-[39.99rem]:text-[.65rem]">
                Xem chủ đề
                <i className="fad fa-arrow-right" aria-hidden="true" />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
