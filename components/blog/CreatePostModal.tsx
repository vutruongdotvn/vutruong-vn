"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";
import { createPost, updatePost } from "@/services/postService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";

function safeParseArray(value: any): string[] {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  return [];
}

type ExistingImageItem = {
  type: "existing";
  url: string;
  public_id: string;
};

type NewImageItem = {
  type: "new";
  url: string;
  file: File;
};

type ImageItem = ExistingImageItem | NewImageItem;

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
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const { showToast } = useToast();

  const isEditMode = !!editingPost;

  const trimmedContent = content.trim();
  const trimmedOriginalContent = originalContent.trim();

  const originalExistingImages: ExistingImageItem[] = useMemo(() => {
    const safeImages = safeParseArray(editingPost?.images);
    const safePublicIds = safeParseArray(editingPost?.public_ids);

    if (!safeImages.length) return [];

    return safeImages.map((url: string, index: number) => ({
      type: "existing",
      url,
      public_id: safePublicIds[index] || "",
    }));
  }, [editingPost]);

  const currentExistingPublicIds = imageItems
    .filter((item): item is ExistingImageItem => item.type === "existing")
    .map((item) => item.public_id);

  const removedExistingPublicIds = originalExistingImages
    .map((item) => item.public_id?.trim())
    .filter((id): id is string => !!id && !currentExistingPublicIds.includes(id));

  const newFiles = imageItems
    .filter((item): item is NewImageItem => item.type === "new")
    .map((item) => item.file);

  const hasTextChanged = trimmedContent !== trimmedOriginalContent;
  const hasImagesChanged =
    removedExistingPublicIds.length > 0 || newFiles.length > 0;

  const hasUnsavedChanges =
    isEditMode
      ? hasTextChanged || hasImagesChanged
      : trimmedContent.length > 0 || imageItems.length > 0;

  const canSubmitEdit =
    isEditMode &&
    (hasTextChanged || hasImagesChanged) &&
    (trimmedContent.length > 0 || imageItems.length > 0);

  const canSubmitCreate =
    !isEditMode && (trimmedContent.length > 0 || newFiles.length > 0);

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

  // cleanup blob preview URLs only
  useEffect(() => {
    return () => {
      imageItems.forEach((item) => {
        if (item.type === "new" && item.url.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      });
    };
  }, [imageItems]);

  // fill data when open
  useEffect(() => {
    if (!isOpen) return;

    if (isEditMode && editingPost) {
      const oldContent = editingPost.content || "";
      const safeImages = safeParseArray(editingPost.images);
      const safePublicIds = safeParseArray(editingPost.public_ids);

      const oldImages: ExistingImageItem[] = safeImages.map(
        (url: string, index: number) => ({
          type: "existing",
          url,
          public_id: safePublicIds[index] || "",
        })
      );

      setContent(oldContent);
      setOriginalContent(oldContent);
      setImageItems(oldImages);
    } else {
      setContent("");
      setOriginalContent("");
      setImageItems([]);
    }
  }, [isOpen, isEditMode, editingPost]);

  // auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "0px";
    const nextHeight = Math.min(textarea.scrollHeight, 420);
    textarea.style.height = `${nextHeight}px`;
  }, [content, isOpen]);

  if (!isOpen || !mounted) return null;

  const appendFiles = (selectedFiles: File[]) => {
    if (!selectedFiles.length) return;

    const imageFiles = selectedFiles.filter((file) =>
      file.type.startsWith("image/")
    );

    if (!imageFiles.length) {
      showToast("Chỉ hỗ trợ upload hình ảnh", "warning");
      return;
    }

    const newItems: NewImageItem[] = imageFiles.map((file) => ({
      type: "new",
      file,
      url: URL.createObjectURL(file),
    }));

    setImageItems((prev) => [...prev, ...newItems]);
  };

  const handleSelectImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    appendFiles(selectedFiles);

    // reset input để cùng 1 file vẫn chọn lại được
    e.target.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImageItems((prev) => {
      const removed = prev[index];

      if (removed?.type === "new" && removed.url.startsWith("blob:")) {
        URL.revokeObjectURL(removed.url);
      }

      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSafeClose = () => {
    if (loading) return;

    if (hasUnsavedChanges) {
      const confirmed = window.confirm(
        "Bạn có thay đổi chưa lưu. Xác nhận Hủy chỉnh sửa?"
      );
      if (!confirmed) return;
    }

    onClose();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files || []);
    appendFiles(droppedFiles);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedFiles = Array.from(e.clipboardData.files || []);
    if (!pastedFiles.length) return;
    appendFiles(pastedFiles);
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
      const keptExistingImages = imageItems.filter(
        (item): item is ExistingImageItem => item.type === "existing"
      );

      console.log("🧩 editingPost.images:", editingPost.images);
      console.log("🧩 editingPost.public_ids:", editingPost.public_ids);
      console.log("🧩 originalExistingImages:", originalExistingImages);
      console.log("🧩 currentExistingPublicIds:", currentExistingPublicIds);
      console.log("🧩 removedExistingPublicIds:", removedExistingPublicIds);

      result = await updatePost({
        postId: editingPost.id,
        content: content.trim(),
        existingImages: keptExistingImages.map((item) => item.url),
        existingPublicIds: keptExistingImages.map((item) => item.public_id),
        removedPublicIds: removedExistingPublicIds,
        newFiles,
      });
    } else {
      result = await createPost({
        content: content.trim(),
        files: newFiles,
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
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[6px]"
        onClick={handleSafeClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 w-full max-w-4xl max-h-[94vh] overflow-hidden rounded-[28px] border border-white/60 bg-white/95 shadow-[0_25px_80px_rgba(0,0,0,0.18)] backdrop-blur-xl animate-fadeIn"
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();

          if (e.currentTarget.contains(e.relatedTarget as Node)) return;
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/25 backdrop-blur-sm">
            <div className="rounded-3xl border border-white/40 bg-white/90 px-8 py-7 text-center shadow-xl">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
                <i className="fa-duotone fa-cloud-arrow-up text-2xl" />
              </div>
              <p className="text-base font-semibold text-gray-900">
                Thả ảnh vào đây
              </p>
              <p className="mt-1 text-sm text-gray-500">
                Ảnh sẽ được thêm ngay vào bài viết
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="sticky top-0 z-20 border-b border-gray-100/80 bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 shadow-sm">
                <i
                  className={`fa-duotone ${
                    isEditMode ? "fa-pen-to-square" : "fa-feather-pointed"
                  } text-lg`}
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[18px] sm:text-[20px] font-semibold text-gray-900 leading-tight">
                    {isEditMode ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
                  </h2>

                  {hasUnsavedChanges && (
                    <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      Chưa lưu
                    </span>
                  )}
                </div>

                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  {isEditMode
                    ? "Chỉnh nội dung, thêm ảnh mới hoặc xóa ảnh cũ"
                    : "Viết bài, dán ảnh bằng Ctrl+V hoặc kéo thả trực tiếp"}
                </p>
              </div>
            </div>

            <button
              onClick={handleSafeClose}
              className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
            >
              <i className="fa-regular fa-xmark text-lg" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="max-h-[calc(94vh-156px)] overflow-y-auto px-5 py-5 sm:px-6">
          <div className="space-y-5">
            {/* Editor card */}
            <div className="overflow-hidden rounded-[28px] border border-gray-200 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
              <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white px-4 py-3 sm:px-5">
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700">
                      <i className="fa-regular fa-file-lines" />
                      Nội dung bài viết
                    </span>

                    {imageItems.length > 0 && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700">
                        <i className="fa-regular fa-images" />
                        {imageItems.length} ảnh
                      </span>
                    )}
                  </div>

                  <div className="text-gray-400">
                    {trimmedContent.length > 0
                      ? `${trimmedContent.length} ký tự`
                      : "Bắt đầu viết..."}
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onPaste={handlePaste}
                  placeholder={
                    isEditMode
                      ? "Chỉnh sửa nội dung bài viết của bạn..."
                      : "Bạn đang nghĩ gì hôm nay?"
                  }
                  className="w-full resize-none overflow-y-auto bg-transparent text-[15px] sm:text-[16px] leading-7 text-gray-900 placeholder:text-gray-400 outline-none min-h-[180px] max-h-[420px]"
                />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5">
                      <i className="fa-regular fa-hashtag" />
                      Hashtag tự nhận diện
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5">
                      <i className="fa-regular fa-arrow-turn-down" />
                      Hỗ trợ xuống dòng
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1.5">
                      <i className="fa-regular fa-paste" />
                      Dán ảnh trực tiếp
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
                  >
                    <i className="fa-regular fa-image text-base" />
                    <span>Thêm ảnh</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Images section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Hình ảnh đính kèm
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500">
                    Kéo thả, chọn file hoặc dán ảnh để thêm nhanh
                  </p>
                </div>

                <div className="text-xs text-gray-400">
                  {imageItems.length > 0
                    ? `${imageItems.length} ảnh hiện có`
                    : "Chưa có ảnh"}
                </div>
              </div>

              {imageItems.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {imageItems.map((img, index) => (
                    <div
                      key={`${img.type}-${img.url}-${index}`}
                      className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-gray-100 shadow-sm transition hover:shadow-md"
                    >
                      <img
                        src={img.url}
                        alt={`preview-${index}`}
                        className="h-40 w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                      />

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

                      <div className="absolute left-3 bottom-3 rounded-full bg-black/65 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
                        {img.type === "existing" ? "Ảnh cũ" : "Ảnh mới"}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition hover:scale-105 hover:bg-black/80 cursor-pointer"
                      >
                        <i className="fa-regular fa-xmark text-sm" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="rounded-[28px] border border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-white px-6 py-12 text-center transition hover:border-gray-400 hover:bg-gray-50 cursor-pointer"
                >
                  <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-gray-700">
                    <i className="fa-duotone fa-images text-2xl" />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">
                    Chưa có ảnh nào được chọn
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    Nhấn để chọn ảnh, kéo thả vào đây hoặc dán ảnh trực tiếp
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 border-t border-gray-100/80 bg-white/95 px-5 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700">
                <i className="fa-regular fa-pen-line" />
                {trimmedContent.length > 0
                  ? `${trimmedContent.length} ký tự`
                  : "Chưa có nội dung"}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700">
                <i className="fa-regular fa-image" />
                {imageItems.length} ảnh
              </span>

              {isEditMode && removedExistingPublicIds.length > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-red-600">
                  <i className="fa-regular fa-trash" />
                  {removedExistingPublicIds.length} ảnh sẽ bị xóa
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSafeClose}
                className="inline-flex items-center justify-center rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
              >
                Hủy
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || (isEditMode ? !canSubmitEdit : !canSubmitCreate)}
                className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-2xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-lg shadow-gray-900/10"
              >
                {loading ? (
                  <>
                    <i className="fa-duotone fa-spinner-third fa-spin text-base" />
                    <span>{isEditMode ? "Đang lưu" : "Đang đăng..."}</span>
                  </>
                ) : (
                  <>
                    <i
                      className={`fa-duotone ${
                        isEditMode ? "fa-floppy-disk" : "fa-paper-plane-top"
                      } text-sm`}
                    />
                    <span>{isEditMode ? "Lưu chỉnh sửa" : "Đăng bài"}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={handleSelectImages}
          />
        </div>
      </div>
    </div>,
    document.body
  );
}