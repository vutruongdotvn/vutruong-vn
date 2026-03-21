"use client";

import { useState } from "react";

type PostCardProps = {
  author: string;
  time: string;
  content: string;
  images?: string[];
};

export default function PostCard({
  author,
  time,
  content,
  images = [],
}: PostCardProps) {
  const [liked, setLiked] = useState(false);

  const renderImages = () => {
    const count = images.length;

    if (count === 1) {
      return (
        <div className="mt-4">
          <div className="bg-gray-200 h-[400px] rounded-xl" />
        </div>
      );
    }

    if (count === 2) {
      return (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.map((_, i) => (
            <div key={i} className="bg-gray-200 h-[250px] rounded-xl" />
          ))}
        </div>
      );
    }

    if (count === 3) {
      return (
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="bg-gray-200 h-[300px] rounded-xl col-span-2" />
          <div className="bg-gray-200 h-[200px] rounded-xl" />
          <div className="bg-gray-200 h-[200px] rounded-xl" />
        </div>
      );
    }

    if (count === 4) {
      return (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {images.map((_, i) => (
            <div key={i} className="bg-gray-200 h-[200px] rounded-xl" />
          ))}
        </div>
      );
    }

    return (
      <div className="mt-4 grid grid-cols-2 gap-2">
        {images.slice(0, 4).map((_, i) => (
          <div key={i} className="relative">
            <div className="bg-gray-200 h-[200px] rounded-xl" />

            {i === 3 && (
              <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center text-white text-2xl font-semibold">
                +{count - 4}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 hover:shadow-md transition">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-300" />
          <div>
            <p className="font-semibold text-gray-900">{author}</p>
            <p className="text-xs text-gray-500">{time}</p>
          </div>
        </div>

        <button className="text-gray-400 hover:text-gray-600">
          <i className="fa-duotone fa-ellipsis"></i>
        </button>
      </div>

      {/* CONTENT */}
      <p className="mt-3 text-gray-800">{content}</p>

      {/* IMAGES */}
      {renderImages()}

      {/* STATS */}
      <div className="flex items-center justify-between text-sm text-gray-500 mt-4">
        <span className="flex items-center gap-1">
          <i className="fa-duotone fa-heart text-red-500"></i> 125
        </span>
        <span>3 bình luận</span>
      </div>

      {/* ACTION BAR */}
      <div className="flex border-t mt-3 pt-2 text-sm">
        
        <button
          onClick={() => setLiked(!liked)}
          className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg hover:bg-gray-100 transition ${
            liked ? "text-red-500" : "text-gray-600"
          }`}
        >
          <i className="fa-duotone fa-heart"></i>
          Thích
        </button>

        <button className="flex-1 py-2 flex items-center justify-center gap-2 rounded-lg hover:bg-gray-100 transition text-gray-600">
          <i className="fa-duotone fa-comment"></i>
          Bình luận
        </button>

        <button className="flex-1 py-2 flex items-center justify-center gap-2 rounded-lg hover:bg-gray-100 transition text-gray-600">
          <i className="fa-duotone fa-share"></i>
          Chia sẻ
        </button>

      </div>

      {/* COMMENT BOX */}
      <div className="flex items-center gap-2 mt-3">
        <div className="w-8 h-8 bg-gray-300 rounded-full" />
        <input
          placeholder="Viết bình luận..."
          className="flex-1 bg-gray-100 px-3 py-2 rounded-full text-sm outline-none"
        />
      </div>

    </div>
  );
}