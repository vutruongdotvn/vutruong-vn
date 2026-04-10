"use client";

import Image from "next/image";

type WatchPlayerProps = {
  title: string;
  episodeName?: string;
  embedUrl?: string;
  backdropUrl: string;
};

export default function WatchPlayer({
  title,
  episodeName,
  embedUrl,
  backdropUrl,
}: WatchPlayerProps) {
  return (
    <section className="relative w-full overflow-hidden">
      <div className="absolute inset-0 movieCover">
        <Image
          src={backdropUrl}
          alt={title}
          fill
          sizes="100vw"
          className="object-cover blur-xl opacity-75"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/70 to-black" />
      </div>

      <div className="relative mx-auto w-full">
        <div className="overflow-hidden moviePlayer">
          <div className="relative aspect-[2.39/1] w-full mt-[85px]">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                title={`${title} - ${episodeName || "Player"}`}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">

                <h2 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {title}
                </h2>

                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">
                  Phim đang được cập nhật.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="px-4 py-5 sm:px-2 hidden">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-medium tracking-[0.22em] text-white/45 uppercase">
                Now Watching
              </p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-white sm:text-2xl">
                {title}
              </h1>
              {episodeName ? (
                <p className="mt-1 text-sm text-white/55">{episodeName}</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}