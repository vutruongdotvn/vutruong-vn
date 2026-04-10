"use client";

import { useEffect, useRef, useState } from "react";

type Actor =
  | string
  | {
      name: string;
      thumb_url?: string;
      character?: string;
      known_for_department?: string;
      profile_path?: string;
    };

const TMDB_CDN = "https://image.tmdb.org/t/p/w185";
const OPHIM_CDN = "https://ophim1.com";

function getAvatar(actor: any, name: string) {
  if (actor?.profile_path) {
    return `${TMDB_CDN}${actor.profile_path}`;
  }

  if (actor?.thumb_url) {
    if (actor.thumb_url.startsWith("http")) return actor.thumb_url;
    return `${OPHIM_CDN}${actor.thumb_url}`;
  }

  return `https://ui-avatars.com/api/?name=${encodeURIComponent(
    name
  )}&background=111827&color=fff`;
}

function getDepartmentLabel(dep?: string) {
  switch (dep) {
    case "Acting":
      return "Diễn viên";
    default:
      return dep || "";
  }
}

function Slider({
  children,
  group,
}: {
  children: React.ReactNode;
  group: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const [canScroll, setCanScroll] = useState(false);
  const [isStart, setIsStart] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const check = () => {
    const el = ref.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;

    setCanScroll(scrollWidth > clientWidth + 10);
    setIsStart(scrollLeft <= 10);
    setIsEnd(scrollLeft + clientWidth >= scrollWidth - 10);
  };

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;

    ref.current.scrollBy({
      left: dir === "left" ? -400 : 400,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    check();

    const el = ref.current;
    if (!el) return;

    el.addEventListener("scroll", check);
    window.addEventListener("resize", check);

    return () => {
      el.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
    };
  }, []);

  return (
    <div className="relative">
      {canScroll && !isStart && (
        <button
          onClick={() => scroll("left")}
          className="opacity-0 sm:opacity-100 absolute left-0 top-1/2 z-10 -translate-y-1/2 bg-black/60 p-2 rounded-full cursor-pointer active:scale-95"
        >
          <i className="fa-duotone fa-arrow-left text-white" />
        </button>
      )}

      {canScroll && !isEnd && (
        <button
          onClick={() => scroll("right")}
          className="opacity-0 sm:opacity-100 absolute right-0 top-1/2 z-10 -translate-y-1/2 bg-black/60 p-2 rounded-full cursor-pointer active:scale-95"
        >
          <i className="fa-duotone fa-arrow-right text-white" />
        </button>
      )}

      <div
        ref={ref}
        className="flex gap-3 overflow-x-auto scrollbar-none"
      >
        {children}
      </div>
    </div>
  );
}

export default function CastSlider({
  actors = [],
}: {
  actors: Actor[];
}) {
  if (!actors.length) return null;

  const cast = actors.filter(
    (a: any) => typeof a !== "string" && a.known_for_department === "Acting"
  );

  const crew = actors.filter(
    (a: any) => typeof a !== "string" && a.known_for_department !== "Acting"
  );

  const fallback = actors.filter((a) => typeof a === "string");

  const group = "watch-cast";

  const renderItem = (actor: Actor, index: number) => {
    const isString = typeof actor === "string";

    const name = isString ? actor : actor.name;

    const avatar = isString
      ? getAvatar(null, name)
      : getAvatar(actor, name);

    const character = !isString ? actor.character?.trim() : "";
    const role = !isString
      ? getDepartmentLabel(actor.known_for_department)
      : "";

    return (
      <div
        key={index}
        className="min-w-[120px] max-w-[120px] group text-center cursor-pointer"
      >
        <a data-fancybox={group} href={avatar}>
          <div className="relative overflow-hidden rounded-xl bg-white/5">
            <div className="aspect-[3/4] w-full overflow-hidden">
              <img
                src={avatar}
                alt={name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              />
            </div>

            <div className="absolute inset-0 bg-black/70 opacity-0 transition duration-300 group-hover:opacity-100 flex flex-col justify-end p-2">
              {character && (
                <p className="text-[11px] text-white line-clamp-2">
                  {character}
                </p>
              )}
              {role && (
                <p className="text-[10px] text-white/70 uppercase">
                  {role}
                </p>
              )}
            </div>
          </div>
        </a>

        <p className="mt-2 px-1 text-xs sm:text-sm font-semibold line-clamp-1 text-white">
          {name}
        </p>

        {!character && role && (
          <p className="text-[10px] text-white/40 uppercase">
            {role}
          </p>
        )}
      </div>
    );
  };

  return (
    <section className="bg-white/5 border border-white/10 backdrop-blur-xl p-5 rounded-2xl space-y-6">
      {cast.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Diễn viên
          </h2>
          <Slider group={group}>
            {cast.slice(0, 20).map(renderItem)}
          </Slider>
        </div>
      )}

      {crew.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Đội ngũ sản xuất
          </h2>
          <Slider group={group}>
            {crew.slice(0, 20).map(renderItem)}
          </Slider>
        </div>
      )}

      {!cast.length && !crew.length && fallback.length > 0 && (
        <div>
          <h2 className="mb-3 text-lg font-semibold text-white">
            Diễn viên
          </h2>
          <Slider group={group}>
            {fallback.slice(0, 20).map(renderItem)}
          </Slider>
        </div>
      )}
    </section>
  );
}