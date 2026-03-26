"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { createPost, updatePost } from "@/services/postService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editingPost?: any | null;
};

export default function CreatePostModal({
  isOpen,
  onClose,
  editingPost,
}: Props) {
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { showToast } = useToast();

  const isEditMode = !!editingPost;

  const trimmedContent = content.trim();
  const trimmedOriginalContent = originalContent.trim();

  const hasChanged = trimmedContent !== trimmedOriginalContent;
  const canSubmitEdit = isEditMode && hasChanged && trimmedContent.length > 0;
  const canSubmitCreate =
    !isEditMode && (trimmedContent.length > 0 || files.length > 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // lock scroll
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

  // cleanup preview URLs
  useEffect(() => {
    return () => {
      images.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [images]);

  // fill data when open
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && editingPost) {
      const oldContent = editingPost.content || "";
      setContent(oldContent);
      setOriginalContent(oldContent);
      setImages([]);
      setFiles([]);
    } else {
      setContent("");
      setOriginalContent("");
      setImages([]);
      setFiles([]);
    }
  }, [isOpen, isEditMode, editingPost]);

  if (!isOpen || !mounted) return null;

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isEditMode) return;

    const selectedFiles = Array.from(e.target.files || []);
    const urls = selectedFiles.map((file) => URL.createObjectURL(file));

    setImages((prev) => [...prev, ...urls]);
    setFiles((prev) => [...prev, ...selectedFiles]);
  };

  const handleRemoveImage = (index: number) => {
    if (isEditMode) return;

    setImages((prev) => prev.filter((_, i) => i !== index));
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!canSubmitCreate && !canSubmitEdit) return;

    setLoading(true);

    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if (!user) {
      showToast("Bạn cần đăng nhập để đăng bài", "warning");
      setLoading(false);
      return;
    }

    let result;

    if (isEditMode && editingPost) {
      result = await updatePost({
        postId: editingPost.id,
        content: content.trim(),
      });
    } else {
      result = await createPost({
        content: content.trim(),
        files,
        user_id: user.id,
        visibility: "public",
      });
    }

    setLoading(false);

    if (result?.success) {
      onClose();
      window.location.reload();
    } else {
      showToast(
        result?.error ||
          (isEditMode ? "Không thể cập nhật bài viết" : "Không thể đăng bài"),
        "error"
      );
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
        {/* Header */}
        <div className="flex items-center justify-between border-b pb-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-500"
          >
            <i className="fa-regular fa-xmark text-base" />
          </button>
        </div>

        {/* Textarea */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            isEditMode
              ? "Chỉnh sửa nội dung bài viết..."
              : "Bạn đang nghĩ gì?"
          }
          className="w-full min-h-[140px] resize-none outline-none text-[15px] text-gray-800 placeholder:text-gray-400"
        />

        {/* Image preview */}
        {!isEditMode && images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-3">
            {images.map((img, index) => (
              <div key={index} className="relative rounded-xl overflow-hidden">
                <img
                  src={img}
                  alt={`preview-${index}`}
                  className="w-full h-28 object-cover"
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 rounded-full text-xs"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t">
          {!isEditMode ? (
            <label className="cursor-pointer inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900">
              <i className="fa-regular fa-image text-base" />
              <span>Ảnh</span>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleSelectImages}
              />
            </label>
          ) : (
            <div className="text-xs text-gray-400">
              Chế độ hiện tại: chỉ chỉnh sửa nội dung
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={loading || (isEditMode ? !canSubmitEdit : !canSubmitCreate)}
            className="px-4 py-2 rounded-lg bg-gray-900 text-white text-sm font-medium hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? isEditMode
                ? "Đang lưu..."
                : "Đang đăng..."
              : isEditMode
              ? "Lưu chỉnh sửa"
              : "Đăng bài"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}