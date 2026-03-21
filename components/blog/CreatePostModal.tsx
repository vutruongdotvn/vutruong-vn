"use client";

import { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreatePostModal({ isOpen, onClose }: Props) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    const urls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...urls]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-lg rounded-2xl shadow-xl p-4 z-10 animate-fadeIn">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-semibold text-lg">Tạo bài viết</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        {/* USER */}
        <div className="flex items-center gap-3 mt-4 hidden">
          <div className="w-10 h-10 bg-gray-300 rounded-full" />
          <p className="font-semibold">Vũ Trường</p>
        </div>

        {/* TEXTAREA */}
        <textarea
          placeholder="Bạn đang nghĩ gì?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mt-4 resize-none outline-none text-lg placeholder-gray-400"
          rows={8}
        />

        {/* IMAGE PREVIEW */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img
                  src={img}
                  className="w-full h-24 object-cover rounded-lg"
                />

                {/* remove */}
                <button
                  onClick={() =>
                    setImages(images.filter((_, idx) => idx !== i))
                  }
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 rounded"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-4 border rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">Thêm vào bài viết</span>

          <label className="cursor-pointer text-green-600 font-medium">
            📷 Ảnh
            <input
              type="file"
              multiple
              hidden
              onChange={handleSelectImages}
            />
          </label>
        </div>

        {/* SUBMIT */}
        <button
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 transition text-white py-2 rounded-xl font-semibold disabled:opacity-50"
          disabled={!content && images.length === 0}
        >
          Đăng bài
        </button>
      </div>
    </div>
  );
}