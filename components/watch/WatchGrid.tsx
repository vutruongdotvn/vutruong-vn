"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Item = {
  _id: string;
  name: string;
  origin_name?: string;
  slug: string;
  thumb_url: string;
  episode_current?: string;
  quality?: string;
};

const CDN = "https://img.ophim.live/uploads/movies";

export default function WatchGrid({ items }: { items: Item[] }) {
  return (
    <section className="mt-8">
      <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
        {items?.map((item, index) => (
          <Card key={item._id} item={item} index={index} />
        ))}
      </div>
    </section>
  );
}

function Card({ item, index }: { item: Item; index: number }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <Link
      href={`/watch/${item.slug}`} prefetch={false}
      className="group block"
      style={{
        animation: `fadeUp 1s ease forwards`,
        animationDelay: `${index * 0.1}s`,
        opacity: 0,
      }}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-neutral-900">

        {/* Skeleton shimmer */}
        {!loaded && (
          <div className="absolute inset-0 shimmer" />
        )}

        {/* Image */}
        <Image
          src={`${CDN}/${item.thumb_url}`}
          alt={item.name}
          fill unoptimized
          sizes="(max-width: 640px) 120px,
       (max-width: 1024px) 140px,
       160px"
       priority={index < 4}
          onLoad={() => setLoaded(true)}
          className={`object-cover transition duration-300 ease-in-out ${loaded
            ? "opacity-100 scale-100 blur-0"
            : "opacity-0 scale-105 blur-xs"
            } group-hover:scale-103`}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300" />

        {/* Badge */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {item.episode_current && (
            <span className="bg-black/70 backdrop-blur text-[10px] px-2 py-[2px] rounded">
              {item.episode_current}
            </span>
          )}
        </div>
      </div>

      {/* Text */}
      <div className="mt-3 mb-4 space-y-[2px] text-center">
        <p className="text-xs sm:text-sm lg:text-base font-medium text-white/90 leading-tight line-clamp-1 group-hover:text-white transition">
          {item.name}
        </p>

        {item.origin_name && (
          <p className="text-[0.75rem] sm:text-xs lg:text-sm text-gray-500 line-clamp-1">
            {item.origin_name}
          </p>
        )}
      </div>
    </Link>
  );
}