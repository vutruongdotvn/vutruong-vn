"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createPost } from "@/services/postService";
import { supabase } from "@/lib/supabase"; // ✅ thêm

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export default function CreatePostModal({ isOpen, onClose }: Props) {
  const [content, setContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  useEffect(() => {
    return () => {
      images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  if (!isOpen || !mounted) return null;

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...urls]);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // 🔥 SỬA CHÍNH Ở ĐÂY
  const handleSubmit = async () => {
    if (!content.trim() && files.length === 0) return;

    setLoading(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      alert("Bạn chưa đăng nhập!");
      setLoading(false);
      return;
    }

    const result = await createPost({
      content,
      files,
      user_id: user.id, // ✅ thêm user_id
    });

    setLoading(false);

    if (result?.success) {
      //setContent("");
      //setImages([]);
      //setFiles([]);
      //onClose();
      window.location.reload();
    } else {
      alert(result?.error || "Lỗi đăng bài 😢");
      console.error(result);
    }
  };

  return createPortal(
    <div className="fixed inset-0 h-screen z-[9998] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/10 backdrop-blur-xs"
        onClick={onClose}
      />

      <div className="relative bg-white w-full max-w-lg rounded-xl shadow-xl p-4 mx-2 z-10 animate-fadeIn">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="font-semibold text-lg">Đăng bài viết</h2>
          <button
            title="Đóng"
            onClick={onClose}
            className="text-gray-500 hover:text-black cursor-pointer"
          >
            <i className="fa-duotone fa-times" />
          </button>
        </div>

        <textarea
          placeholder="Nội dung bài viết"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full mt-4 resize-none outline-none text-base placeholder-gray-400"
          rows={10}
        />

        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {images.map((img, i) => (
              <div key={i} className="relative">
                <img src={img} className="w-full h-24 object-cover rounded-lg" />

                <button
                  onClick={() => handleRemoveImage(i)}
                  className="absolute top-1 right-1 bg-black/60 text-white text-xs px-2 rounded"
                >
                  <i className="fa-duotone fa-times" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 border rounded-xl p-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">Thêm vào bài viết</span>

          <label className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-black font-bold text-sm">
            <i className="fa-duotone fa-image text-lg"></i> Hình ảnh
            <input type="file" multiple hidden onChange={handleSelectImages} />
          </label>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading || (!content && images.length === 0)}
          className="w-full mt-4 bg-blue-500 hover:bg-blue-600 active:bg-blue-800 transition text-white py-2 rounded-lg font-semibold disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Đang đăng..." : "Đăng"}
        </button>
      </div>
    </div>,
    document.body
  );
}