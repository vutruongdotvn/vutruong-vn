"use client";

import { useState } from "react";

type Props = {
    videoId: string;
};

export default function PostEmbed({ videoId }: Props) {
    const [isPlaying, setIsPlaying] = useState(false);

    const thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

    return (
        <div className="relative mt-3 aspect-video w-full overflow-hidden bg-black">
            {!isPlaying ? (
                // 🎬 THUMBNAIL PREVIEW
                <button
                    type="button"
                    onClick={() => setIsPlaying(true)}
                    className="group relative w-full h-full cursor-pointer"
                >
                    <img
                        src={thumbnail}
                        alt="Video thumbnail"
                        loading="lazy"
                        className="w-full h-full object-cover"
                    />

                    {/* overlay dark */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />

                    {/* play button */}
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/70 backdrop-blur-xl shadow-lg group-hover:scale-105 transition">
                            <i className="fad fa-play text-black ml-1" />
                        </div>
                    </div>
                </button>
            ) : (
                // 🎥 IFRAME (lazy load)
                <iframe
                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                    title="YouTube video"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="w-full h-full"
                />
            )}
        </div>
    );
}