"use client";

import { useState, useEffect, useMemo, useRef, useLayoutEffect, memo } from "react";
import { createPortal } from "react-dom";
import { createPost, updatePost, getPostById } from "@/services/postService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/useToast";
import { compressImage } from "@/lib/compressImage";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

function generateLocalImageId() {
  return `img_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

type ExistingImageItem = {
  id: string;
  type: "existing";
  url: string;
  public_id: string;
};

type NewImageItem = {
  id: string;
  type: "new";
  url: string;
  file: File;
};

export type OrderedImageItem = ExistingImageItem | NewImageItem;
type ImageItem = OrderedImageItem;

type Props = {
  isOpen: boolean;
  onClose: () => void;
  editingPost?: any | null;
  onSuccess?: (updatedPost: any) => void;
};

type SortableImageCardProps = {
  img: ImageItem;
  index: number;
  onRemove: (index: number) => void;
};

const getOptimizedPreviewUrl = (
  url: string,
  width = 320,
  height = 220
) => {
  if (!url) return url;

  // ảnh local preview khi mới chọn từ máy
  if (url.startsWith("blob:")) return url;

  // chỉ xử lý ảnh cloudinary
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  return url.replace(
    "/upload/",
    `/upload/f_auto,q_auto,c_fill,w_${width},h_${height}/`
  );
};

// compress ảnh trước khi upload để tối ưu tài nguyên và dữ liệu
const compressFilesBeforeUpload = async (files: File[]) => {
  const processed = await Promise.all(
    files.map(async (file) => {
      const shouldCompress =
        file.size > 450 * 1024 || /image\/(jpeg|jpg|png|webp)/i.test(file.type);

      if (!shouldCompress) return file;

      return await compressImage(file, {
        maxSizeMB: 1.4,
        maxWidthOrHeight: 2200,
        initialQuality: 0.84,
      });
    })
  );

  return processed;
};


const SortableImageCard = memo(function SortableImageCard({
  img,
  index,
  onRemove,
}: SortableImageCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: img.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: isDragging ? undefined : transition,
    willChange: "transform",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-sm select-none touch-none ${isDragging ? "z-20 opacity-90" : "hover:shadow-md"
        }`}
    >
      <img
        src={getOptimizedPreviewUrl(img.url, 220, 160)}
        alt={`preview-${index}`}
        loading="lazy"
        draggable={false}
        className="h-40 w-full object-cover pointer-events-none"
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

      <div className="absolute left-3 bottom-3 rounded-full bg-black/65 px-3 py-1.5 text-[11px] font-medium text-white">
        {index === 0
          ? "Ảnh bìa"
          : img.type === "existing"
            ? "Ảnh cũ"
            : "Ảnh mới"}
      </div>

      {/* Drag handle */}
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="absolute left-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white cursor-grab active:cursor-grabbing"
        title="Kéo để sắp xếp"
      >
        <i className="fa-duotone fa-grip-dots text-xs" />
      </button>

      {/* Remove */}
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-red-400 cursor-pointer"
      >
        <i className="fa-duotone fa-xmark text-xs" />
      </button>
    </div>
  );
});

export default function CreatePostModal({
  isOpen,
  onClose,
  editingPost,
  onSuccess,
}: Props) {
  const [content, setContent] = useState("");
  const [originalContent, setOriginalContent] = useState("");
  const [imageItems, setImageItems] = useState<ImageItem[]>([]);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const editorWrapRef = useRef<HTMLDivElement | null>(null);

  const [selectionHint, setSelectionHint] = useState<{
    visible: boolean;
    top: number;
    left: number;
  } | null>(null);

  const { showToast } = useToast();

  const isEditMode = !!editingPost;

  const trimmedContent = content.trim();
  const trimmedOriginalContent = originalContent.trim();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 180,
        tolerance: 8,
      },
    })
  );

  const originalExistingImages: ExistingImageItem[] = useMemo(() => {
    const safeImages = safeParseArray(editingPost?.images);
    const safePublicIds = safeParseArray(editingPost?.public_ids);

    if (!safeImages.length) return [];

    return safeImages.map((url: string, index: number) => ({
      id: generateLocalImageId(),
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

  const hasImageOrderChanged =
    isEditMode &&
    imageItems
      .filter((item): item is ExistingImageItem => item.type === "existing")
      .map((item) => item.public_id)
      .join("|") !==
    originalExistingImages.map((item) => item.public_id).join("|");

  const hasImagesChanged =
    removedExistingPublicIds.length > 0 ||
    newFiles.length > 0 ||
    hasImageOrderChanged;

  const hasUnsavedChanges = isEditMode
    ? hasTextChanged || hasImagesChanged
    : trimmedContent.length > 0 || imageItems.length > 0;

  const canSubmitEdit =
    isEditMode &&
    (hasTextChanged || hasImagesChanged) &&
    (trimmedContent.length > 0 || imageItems.length > 0);

  const canSubmitCreate =
    !isEditMode && (trimmedContent.length > 0 || newFiles.length > 0);
  const activeDragItem = useMemo(
    () => imageItems.find((item) => item.id === activeDragId) || null,
    [imageItems, activeDragId]
  );
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) {
      setSelectionHint(null);
    }
  }, [isOpen]);

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
          id: generateLocalImageId(),
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
  useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = "auto";
    textarea.style.height = `${textarea.scrollHeight}px`;
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
      id: generateLocalImageId(),
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
        "Bài viết chưa được lưu, xác nhận Hủy?"
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
  const handleDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id));
  };
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragId(null);

    if (!over || active.id === over.id) return;

    setImageItems((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return prev;

      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const updateSelectionHint = () => {
    const textarea = textareaRef.current;
    const wrap = editorWrapRef.current;

    if (!textarea || !wrap) {
      setSelectionHint(null);
      return;
    }

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) {
      setSelectionHint(null);
      return;
    }

    const selectedText = textarea.value.slice(start, end).trim();

    if (!selectedText) {
      setSelectionHint(null);
      return;
    }

    const textareaRect = textarea.getBoundingClientRect();
    const wrapRect = wrap.getBoundingClientRect();

    // đặt hint ở góc trên phải textarea cho nhẹ, ổn định, không cần đo caret phức tạp
    setSelectionHint({
      visible: true,
      top: textareaRect.top - wrapRect.top + 10,
      left: textareaRect.right - wrapRect.left - 110,
    });
  };

  const handleWrapBold = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    if (start === end) return;

    const selected = content.slice(start, end);
    const alreadyBold =
      selected.startsWith("**") && selected.endsWith("**") && selected.length >= 4;

    let nextContent = "";
    let nextSelectionStart = start;
    let nextSelectionEnd = end;

    if (alreadyBold) {
      const unwrapped = selected.slice(2, -2);
      nextContent =
        content.slice(0, start) + unwrapped + content.slice(end);

      nextSelectionStart = start;
      nextSelectionEnd = start + unwrapped.length;
    } else {
      nextContent =
        content.slice(0, start) + `**${selected}**` + content.slice(end);

      nextSelectionStart = start + 2;
      nextSelectionEnd = end + 2;
    }

    setContent(nextContent);
    setSelectionHint(null);

    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
    });
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const items = Array.from(e.clipboardData?.items || []);

    const imageFiles = items
      .filter((item) => item.type.startsWith("image/"))
      .map((item) => item.getAsFile())
      .filter((file): file is File => !!file);

    if (imageFiles.length > 0) {
      e.preventDefault();
      appendFiles(imageFiles);
      showToast(`Đã dán ${imageFiles.length} ảnh`, "success");
      return;
    }
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

    let result: any;

    if (isEditMode && editingPost) {
      console.log("🧩 editingPost.images:", editingPost.images);
      console.log("🧩 editingPost.public_ids:", editingPost.public_ids);
      console.log("🧩 originalExistingImages:", originalExistingImages);
      console.log("🧩 currentExistingPublicIds:", currentExistingPublicIds);
      console.log("🧩 removedExistingPublicIds:", removedExistingPublicIds);
      console.log("🧩 orderedImageItems:", imageItems);

      result = await updatePost({
        postId: editingPost.id,
        content: content.trim(),
        removedPublicIds: removedExistingPublicIds,
        orderedImageItems: imageItems,
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
      // ✏️ EDIT REALTIME
      if (isEditMode && editingPost) {
        const freshPost = await getPostById(editingPost.id);

        if (freshPost) {
          onSuccess?.(freshPost);
        }
      }

      // 🆕 CREATE REALTIME
      if (!isEditMode) {
        const freshPost = await getPostById(result.id);

        if (freshPost) {
          onSuccess?.(freshPost);
        }
      }

      onClose();
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
    <div className="fixed inset-0 z-[9998] flex items-center justify-center p-0 sm:p-5">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[3px]"
        onClick={handleSafeClose}
      />

      {/* Modal */}
      <div
        className="relative z-10 flex w-full max-w-4xl max-h-screen md:max-h-[94vh] flex-col overflow-hidden
        rounded-0 md:rounded-3xl border border-white/60 bg-white shadow-[0_25px_80px_rgba(0,0,0,0.18)] animate-fadeIn"
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
            <div className="rounded-xl border border-white/40 bg-white/90 px-8 py-7 text-center shadow-xl">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-gray-700">
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
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 text-gray-800 shadow-sm">
                <i
                  className={`fa-duotone ${isEditMode ? "fa-pen-to-square" : "fa-feather-pointed"
                    } text-lg`}
                />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-[18px] sm:text-[20px] font-semibold text-gray-900 leading-tight">
                    {isEditMode ? "Chỉnh sửa bài viết" : "Đăng bài viết"}
                  </h2>
                </div>
                <p className="mt-0.5 text-sm text-gray-500 hidden">
                  {isEditMode
                    ? "Sửa nội dung, thêm/xóa ảnh"
                    : "Đăng bài viết hoặc hình ảnh"}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleSafeClose}
              className="flex h-11 w-11 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 cursor-pointer"
              aria-label="Đóng"
            >
              <i className="fa-duotone fa-xmark text-2xl" />
            </button>
          </div>
        </div>

        {/* Scroll body */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6 bg-white">
          <div className="space-y-6">
            {/* Editor */}
            <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_10px_40px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-4 py-3">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-gray-600">
                  <i className="fa-duotone fa-file-lines" />
                  <span>Nội dung bài viết</span>
                </div>

                <div className="text-xs font-medium text-gray-400">
                  {content.length} ký tự
                </div>
              </div>

              <div ref={editorWrapRef} className="relative p-4 sm:p-5">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setSelectionHint(null);
                  }}
                  onPaste={handlePaste}
                  onMouseUp={updateSelectionHint}
                  onKeyUp={updateSelectionHint}
                  onSelect={updateSelectionHint}
                  onBlur={() => {
                    setTimeout(() => setSelectionHint(null), 120);
                  }}
                  placeholder={
                    isEditMode
                      ? "Chỉnh sửa nội dung bài viết..."
                      : "Bạn đang nghĩ gì?"
                  }
                  className="w-full bg-transparent text-base/6 text-gray-900 placeholder:text-gray-400 outline-none resize-none overflow-hidden min-h-[1rem] align-top"
                />

                {/* Nút Bold floating right
                {selectionHint?.visible && (
                  <button
                    type="button"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={handleWrapBold}
                    className="absolute z-20 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/95 px-3 py-2 text-xs font-medium text-gray-700 shadow-md backdrop-blur-sm transition hover:bg-gray-50"
                    style={{
                      top: selectionHint.top,
                      left: selectionHint.left,
                    }}
                  >
                    <i className="fa-duotone fa-bold" />
                    **In đậm**
                  </button>
                )}
                */}


                <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                    <button
                      type="button"
                      onClick={handleWrapBold}
                      className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 transition hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                    >
                      <i className="fa-duotone fa-bold" />
                      In đậm
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 transition hover:bg-gray-200 active:bg-gray-300 cursor-pointer"
                    >
                      <i className="fa-duotone fa-image" />
                      Ảnh
                    </button>
                  </div>
                </div>

              </div>
            </div>

            {/* Image section */}
            <div className="space-y-3">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Hình ảnh
                  </h3>
                </div>

                <div className="text-sm font-medium text-gray-400">
                  {imageItems.length > 0
                    ? `${imageItems.length} ảnh hiện có`
                    : "Chưa có ảnh"}
                </div>
              </div>

              {imageItems.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={imageItems.map((item) => item.id)}
                    strategy={rectSortingStrategy}
                  >
                    <div className="grid grid-cols-2 gap-1 sm:grid-cols-3 lg:grid-cols-4">
                      {imageItems.map((img, index) => (
                        <SortableImageCard
                          key={img.id}
                          img={img}
                          index={index}
                          onRemove={handleRemoveImage}
                        />
                      ))}
                    </div>
                  </SortableContext>
                  <DragOverlay>
                    {activeDragItem ? (
                      <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 shadow-lg opacity-95 w-full max-w-[260px]">
                        <img
                          src={getOptimizedPreviewUrl(activeDragItem.url, 240, 180)}
                          alt=""
                          className="h-40 w-full object-cover pointer-events-none"
                          draggable={false}
                        />
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50/70 px-6 py-10 text-center transition hover:border-gray-400 hover:bg-gray-50"
                >
                  <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                    <i className="fa-duotone fa-image text-2xl" />
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    Chưa có ảnh nào
                  </p>
                  <p className="mt-1 max-w-md text-sm text-gray-500">
                    Nhấn để chọn ảnh, kéo thả hoặc dán ảnh trực tiếp
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 z-20 border-t border-gray-100/80 bg-white/90 px-5 py-4 backdrop-blur-xl sm:px-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700">
                <i className="fa-duotone fa-pen" />
                {content.length} ký tự
              </span>

              <span className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1.5 text-gray-700">
                <i className="fa-duotone fa-image" />
                {imageItems.length} ảnh
              </span>

              {isEditMode && removedExistingPublicIds.length > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-red-600">
                  <i className="fa-duotone fa-trash" />
                  {removedExistingPublicIds.length} ảnh sẽ bị xóa
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleSafeClose}
                className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 cursor-pointer"
              >
                Hủy
              </button>

              <button
                onClick={handleSubmit}
                disabled={loading || (isEditMode ? !canSubmitEdit : !canSubmitCreate)}
                className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-lg shadow-gray-900/10"
              >
                {loading ? (
                  <>
                    <i className="fa-duotone fa-spinner-third fa-spin text-base" />
                    <span>{isEditMode ? "Đang lưu" : "Đang đăng"}</span>
                  </>
                ) : (
                  <>
                    <i
                      className={`fa-duotone ${isEditMode ? "fa-floppy-disk" : "fa-paper-plane-top"
                        } text-sm`}
                    />
                    <span>{isEditMode ? "Lưu" : "Đăng"}</span>
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