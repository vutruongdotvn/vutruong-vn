"use client";

import { useState } from "react";
import Link from "next/link";

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
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-4">
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
      href={`/watch/${item.slug}`}
      className="group block"
      style={{
        animation: `fadeUp 0.4s ease forwards`,
        animationDelay: `${index * 0.03}s`,
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
        <img
          src={`${CDN}/${item.thumb_url}`}
          alt={item.name}
          loading="lazy"
          onLoad={() => setLoaded(true)}
          className={`w-full h-full object-cover transition duration-900 ease-in-out ${
            loaded ? "opacity-100 scale-100 blur-none" : "opacity-0 scale-105 blur-sm"
          } group-hover:scale-105`}
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition duration-300" />

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
        <p className="text-sm sm:text-base font-medium leading-tight line-clamp-1 group-hover:text-white/90 transition">
          {item.name}
        </p>

        {item.origin_name && (
          <p className="text-xs sm:text-sm text-gray-500 line-clamp-1">
            {item.origin_name}
          </p>
        )}
      </div>
    </Link>
  );
}