"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreatePostModal({ isOpen, onClose }: Props) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  // 🔥 mount để dùng portal
  useEffect(() => {
    setMounted(true);
  }, []);

  // 🔥 lock scroll
  useEffect(() => {
    if (isOpen) {
      document.documentElement.style.overflow = "hidden";
      document.body.style.overflow = "hidden";
    } else {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    }

    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const urls = files.map((file) => URL.createObjectURL(file));
    setImages((prev) => [...prev, ...urls]);
  };

  return createPortal(
    <div className="fixed inset-0 h-screen z-[9998] flex items-center justify-center">
      
      {/* BACKDROP */}
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl p-4 mx-2 z-10 animate-fadeIn">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-semibold text-lg">Đăng bài viết</h2>
          <button
            title="Đóng"
            onClick={onClose}
            className="text-gray-500 hover:text-black cursor-pointer"
          >
            <i className="fa-duotone fa-times"/>
          </button>
        </div>

        {/* TEXTAREA */}
        <textarea
          placeholder="Nội dung bài viết"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mt-4 resize-none outline-none text-base placeholder-gray-400"
          rows={10}
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
                  <i className="fa-duotone fa-times"/>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ACTIONS */}
        <div className="mt-4 border rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">Thêm vào bài viết</span>

          <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-black font-bold text-sm">
            <i className="fa-duotone fa-image text-lg"></i> Hình ảnh
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
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-800 transition text-white py-2 rounded-lg font-semibold disabled:opacity-50 cursor-pointer"
          disabled={!content && images.length === 0}
        >
          Đăng
        </button>
      </div>
    </div>,
    document.body
  );
}