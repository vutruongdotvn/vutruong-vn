"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { uploadImage, getFeaturedWidgetImage } from "@/lib/cloudinary";
import { useToast } from "@/hooks/useToast";
import {
  addFeaturedImages,
  createFeaturedStory,
  deleteFeaturedCloudinaryAssets,
  deleteFeaturedImageRecord,
  deleteFeaturedStoryRecord,
  featuredServiceError,
  fetchFeaturedCloudinaryAssets,
  reorderFeaturedImages,
  reorderFeaturedStories,
} from "@/lib/featuredStoryService";
import type {
  FeaturedCloudinaryAsset,
  FeaturedStory,
  FeaturedStoryImage,
} from "@/types/featuredStory";

type Props = {
  open: boolean;
  stories: FeaturedStory[];
  onClose: () => void;
  onChanged: () => Promise<void> | void;
};

export default function FeaturedManagerModal({
  open,
  stories,
  onClose,
  onChanged,
}: Props) {
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const busyRef = useRef(false);
  const onCloseRef = useRef(onClose);

  const [selectedStoryId, setSelectedStoryId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [libraryAssets, setLibraryAssets] = useState<
    FeaturedCloudinaryAsset[]
  >([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [selectedPublicIds, setSelectedPublicIds] = useState<Set<string>>(
    new Set()
  );

  const activeStory = useMemo(
    () => stories.find((story) => story.id === selectedStoryId) ?? null,
    [stories, selectedStoryId]
  );

  const usedPublicIds = useMemo(
    () => new Set(stories.flatMap((story) => story.images.map((image) => image.public_id))),
    [stories]
  );

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!open) return;

    setSelectedStoryId((current) => {
      if (current && stories.some((story) => story.id === current)) return current;
      return stories[0]?.id ?? null;
    });
  }, [open, stories]);

  useEffect(() => {
    if (!open) return;

    const root = document.documentElement;
    const body = document.body;
    const previousRootOverflow = root.style.overflow;
    const previousBodyOverflow = body.style.overflow;
    const previousBodyPaddingRight = body.style.paddingRight;
    const previousStickyPause = root.getAttribute("data-smart-sticky-paused");
    const scrollbarWidth = Math.max(window.innerWidth - root.clientWidth, 0);

    root.dataset.smartStickyPaused = "true";
    root.style.overflow = "hidden";
    body.style.overflow = "hidden";

    if (scrollbarWidth > 0) {
      const currentPaddingRight = Number.parseFloat(
        window.getComputedStyle(body).paddingRight
      ) || 0;
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) onCloseRef.current();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      root.style.overflow = previousRootOverflow;
      body.style.overflow = previousBodyOverflow;
      body.style.paddingRight = previousBodyPaddingRight;

      if (previousStickyPause === null) {
        delete root.dataset.smartStickyPaused;
      } else {
        root.setAttribute("data-smart-sticky-paused", previousStickyPause);
      }

      requestAnimationFrame(() => {
        window.dispatchEvent(new Event("smart-sticky:refresh"));
      });
    };
  }, [open]);

  useEffect(() => {
    if (!pickerOpen || libraryAssets.length > 0) return;
    loadLibrary(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickerOpen]);

  const loadLibrary = async (reset = false) => {
    if (loadingLibrary) return;

    setLoadingLibrary(true);

    try {
      const result = await fetchFeaturedCloudinaryAssets(
        reset ? null : nextCursor
      );

      setLibraryAssets((current) => {
        const combined = reset ? result.assets : [...current, ...result.assets];
        return Array.from(
          new Map(combined.map((asset) => [asset.public_id, asset])).values()
        );
      });
      setNextCursor(result.next_cursor);
    } catch (error) {
      showToast(featuredServiceError(error), "error");
    } finally {
      setLoadingLibrary(false);
    }
  };

  const ensureStory = async () => {
    if (selectedStoryId) return selectedStoryId;

    const story = await createFeaturedStory();
    setSelectedStoryId(story.id);
    return story.id;
  };

  const handleCreateStory = async () => {
    if (busy) return;
    setBusy(true);

    try {
      const story = await createFeaturedStory();
      setSelectedStoryId(story.id);
      await onChanged();
      showToast("Đã tạo một Tin nổi bật mới.", "success");
    } catch (error) {
      showToast(featuredServiceError(error), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleUpload = async (files: FileList | null) => {
    if (!files?.length || busy) return;

    const imageFiles = Array.from(files).filter((file) =>
      file.type.toLowerCase().startsWith("image/")
    );

    if (imageFiles.length === 0) {
      showToast("Vui lòng chọn file hình ảnh hợp lệ.", "warning");
      return;
    }

    setBusy(true);

    try {
      const storyId = await ensureStory();
      const uploads = await Promise.allSettled(
        imageFiles.map((file) => uploadImage(file, "featured"))
      );

      const uploadedAssets = uploads.flatMap((result) =>
        result.status === "fulfilled"
          ? [
              {
                public_id: result.value.public_id,
                secure_url: result.value.url,
                width: result.value.width,
                height: result.value.height,
                format: result.value.format,
              },
            ]
          : []
      );

      if (uploadedAssets.length > 0) {
        await addFeaturedImages(storyId, uploadedAssets);
      }

      await onChanged();
      setLibraryAssets([]);
      setNextCursor(null);

      const failedCount = uploads.length - uploadedAssets.length;

      if (failedCount > 0) {
        showToast(
          `Đã thêm ${uploadedAssets.length} ảnh, ${failedCount} ảnh upload thất bại.`,
          "warning"
        );
      } else {
        showToast(`Đã thêm ${uploadedAssets.length} ảnh.`, "success");
      }
    } catch (error) {
      showToast(featuredServiceError(error), "error");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
      setBusy(false);
    }
  };

  const handleAddSelectedAssets = async () => {
    if (selectedPublicIds.size === 0 || busy) return;
    setBusy(true);

    try {
      const storyId = await ensureStory();
      const assets = libraryAssets.filter(
        (asset) =>
          selectedPublicIds.has(asset.public_id) &&
          !usedPublicIds.has(asset.public_id)
      );

      if (assets.length === 0) {
        throw new Error("Các ảnh đã chọn đang được sử dụng trong Tin nổi bật.");
      }

      await addFeaturedImages(storyId, assets);
      setSelectedPublicIds(new Set());
      setPickerOpen(false);
      await onChanged();
      showToast(`Đã thêm ${assets.length} ảnh từ Cloudinary.`, "success");
    } catch (error) {
      showToast(featuredServiceError(error), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleReorderImages = async (orderedImages: FeaturedStoryImage[]) => {
    if (!activeStory || busy) return;
    setBusy(true);

    try {
      await reorderFeaturedImages(
        activeStory.id,
        orderedImages.map((image) => image.id)
      );
      await onChanged();
    } catch (error) {
      showToast(featuredServiceError(error), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleSetCover = (imageIndex: number) => {
    if (!activeStory || imageIndex === 0) return;
    const ordered = [...activeStory.images];
    const [selected] = ordered.splice(imageIndex, 1);
    ordered.unshift(selected);
    handleReorderImages(ordered);
  };

  const handleMoveImage = (imageIndex: number, direction: -1 | 1) => {
    if (!activeStory) return;

    const targetIndex = imageIndex + direction;
    if (targetIndex < 0 || targetIndex >= activeStory.images.length) return;

    const ordered = [...activeStory.images];
    [ordered[imageIndex], ordered[targetIndex]] = [
      ordered[targetIndex],
      ordered[imageIndex],
    ];
    handleReorderImages(ordered);
  };

  const handleMoveStory = async (direction: -1 | 1) => {
    if (!activeStory || busy) return;

    const currentIndex = stories.findIndex((story) => story.id === activeStory.id);
    const targetIndex = currentIndex + direction;
    if (targetIndex < 0 || targetIndex >= stories.length) return;

    const ordered = [...stories];
    [ordered[currentIndex], ordered[targetIndex]] = [
      ordered[targetIndex],
      ordered[currentIndex],
    ];

    setBusy(true);

    try {
      await reorderFeaturedStories(ordered.map((story) => story.id));
      await onChanged();
    } catch (error) {
      showToast(featuredServiceError(error), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteImage = async (image: FeaturedStoryImage) => {
    if (!activeStory || busy) return;

    const accepted = window.confirm(
      "Xóa vĩnh viễn ảnh này khỏi Tin nổi bật và hệ thống?"
    );
    if (!accepted) return;

    setBusy(true);

    try {
      await deleteFeaturedImageRecord(image.id);

      if (activeStory.images.length === 1) {
        await deleteFeaturedStoryRecord(activeStory.id);
        setSelectedStoryId(null);
      }

      let cloudinaryCleaned = true;

      try {
        await deleteFeaturedCloudinaryAssets([image.public_id]);
      } catch (error) {
        cloudinaryCleaned = false;
        console.error("Featured image cleanup error:", error);
      }

      await onChanged();
      setLibraryAssets((current) =>
        current.filter((asset) => asset.public_id !== image.public_id)
      );

      showToast(
        cloudinaryCleaned
          ? "Đã xóa ảnh Tin nổi bật."
          : "Đã gỡ ảnh khỏi widget, nhưng Cloudinary chưa xóa được asset.",
        cloudinaryCleaned ? "success" : "warning"
      );
    } catch (error) {
      showToast(featuredServiceError(error), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteStory = async () => {
    if (!activeStory || busy) return;

    const accepted = window.confirm(
      `Xóa Tin nổi bật này và toàn bộ ${activeStory.images.length} ảnh vĩnh viễn?`
    );
    if (!accepted) return;

    setBusy(true);

    try {
      const publicIds = activeStory.images.map((image) => image.public_id);
      await deleteFeaturedStoryRecord(activeStory.id);
      setSelectedStoryId(null);

      let cloudinaryCleaned = true;

      try {
        await deleteFeaturedCloudinaryAssets(publicIds);
      } catch (error) {
        cloudinaryCleaned = false;
        console.error("Featured story cleanup error:", error);
      }

      await onChanged();
      setLibraryAssets((current) =>
        current.filter((asset) => !publicIds.includes(asset.public_id))
      );

      showToast(
        cloudinaryCleaned
          ? "Đã xóa Tin nổi bật."
          : "Đã xóa story, nhưng một số asset Cloudinary chưa được dọn.",
        cloudinaryCleaned ? "success" : "warning"
      );
    } catch (error) {
      showToast(featuredServiceError(error), "error");
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteUnusedAsset = async (asset: FeaturedCloudinaryAsset) => {
    if (busy || usedPublicIds.has(asset.public_id)) return;

    const accepted = window.confirm(
      "Xóa vĩnh viễn ảnh chưa sử dụng này khỏi Cloudinary?"
    );
    if (!accepted) return;

    setBusy(true);

    try {
      await deleteFeaturedCloudinaryAssets([asset.public_id]);
      setLibraryAssets((current) =>
        current.filter((item) => item.public_id !== asset.public_id)
      );
      setSelectedPublicIds((current) => {
        const next = new Set(current);
        next.delete(asset.public_id);
        return next;
      });
      showToast("Đã xóa ảnh khỏi Cloudinary.", "success");
    } catch (error) {
      showToast(featuredServiceError(error), "error");
    } finally {
      setBusy(false);
    }
  };

  const toggleAsset = (asset: FeaturedCloudinaryAsset) => {
    if (usedPublicIds.has(asset.public_id) || busy) return;

    setSelectedPublicIds((current) => {
      const next = new Set(current);
      if (next.has(asset.public_id)) next.delete(asset.public_id);
      else next.add(asset.public_id);
      return next;
    });
  };

  if (!open || typeof document === "undefined") return null;

  const activeStoryIndex = activeStory
    ? stories.findIndex((story) => story.id === activeStory.id)
    : -1;

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/40 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label="Quản lý Tin nổi bật"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
        <header className="flex shrink-0 items-center justify-between border-b border-black/5 px-4 py-3 sm:px-6">
          <div>
            <h2 className="font-medium text-base sm:text-lg text-neutral-900">
              Quản lý Tin nổi bật
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Đóng"
            className="flex size-9 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 hover:text-neutral-900 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="fad fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div className="overscroll-contain overflow-y-auto p-4 sm:p-6">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-neutral-800">
                Danh sách story
              </h3>
              <button
                type="button"
                onClick={handleCreateStory}
                disabled={busy}
                className="cursor-pointer rounded-lg bg-neutral-900 px-3 py-2 text-xs font-medium text-white transition hover:bg-black active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <i className="fad fa-plus mr-1.5" aria-hidden="true" />
                Tạo story
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
              {stories.map((story, index) => {
                const cover = story.images[0];
                const selected = story.id === selectedStoryId;

                return (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => setSelectedStoryId(story.id)}
                    className={`group relative aspect-[3/4] cursor-pointer overflow-hidden rounded-xl border-2 transition active:scale-[.98] ${
                      selected
                        ? "border-sky-500 ring-2 ring-sky-100"
                        : "border-transparent bg-neutral-100 hover:border-neutral-300"
                    }`}
                  >
                    {cover ? (
                      <Image
                        src={getFeaturedWidgetImage(cover.secure_url)}
                        alt={`Story ${index + 1}`}
                        fill
                        unoptimized
                        sizes="130px"
                        className="object-cover"
                      />
                    ) : (
                      <span className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-neutral-400">
                        <i className="fad fa-image" aria-hidden="true" />
                        <span className="text-[10px]">Chưa có ảnh</span>
                      </span>
                    )}

                    <span className="absolute bottom-1.5 left-1.5 rounded-full bg-black/60 px-1.5 py-0.5 text-[10px] text-white backdrop-blur-sm">
                      {story.images.length} ảnh
                    </span>
                  </button>
                );
              })}

              {stories.length === 0 && (
                <button
                  type="button"
                  onClick={handleCreateStory}
                  disabled={busy}
                  className="flex aspect-[3/4] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-300 text-xs text-neutral-500 transition hover:bg-neutral-50 hover:text-neutral-800 disabled:opacity-50"
                >
                  <i className="fad fa-plus text-lg" aria-hidden="true" />
                  Tạo story
                </button>
              )}
            </div>
          </section>

          <section className="mt-6 border-t border-black/5 pt-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-neutral-800">
                  {activeStory ? "Ảnh trong story" : "Chọn hoặc tạo một story"}
                </h3>
                {activeStory && (
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Ảnh đầu tiên có nhãn “Bìa” sẽ đại diện cho story.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {activeStory && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleMoveStory(-1)}
                      disabled={busy || activeStoryIndex <= 0}
                      title="Đưa story về trước"
                      className="flex size-9 cursor-pointer items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <i className="fad fa-arrow-left" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMoveStory(1)}
                      disabled={busy || activeStoryIndex >= stories.length - 1}
                      title="Đưa story về sau"
                      className="flex size-9 cursor-pointer items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 disabled:cursor-not-allowed disabled:opacity-35"
                    >
                      <i className="fad fa-arrow-right" aria-hidden="true" />
                    </button>
                  </>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.heic,.heif"
                  multiple
                  className="hidden"
                  onChange={(event) => handleUpload(event.target.files)}
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={busy}
                  className="cursor-pointer rounded-lg bg-sky-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-sky-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="fad fa-cloud-arrow-up mr-1.5" aria-hidden="true" />
                  Upload ảnh
                </button>

                <button
                  type="button"
                  onClick={() => setPickerOpen((current) => !current)}
                  disabled={busy}
                  className="cursor-pointer rounded-lg bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="fad fa-folder-open mr-1.5" aria-hidden="true" />
                  Chọn ảnh có sẵn
                </button>
              </div>
            </div>

            {activeStory?.images.length ? (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-6">
                {activeStory.images.map((image, index) => (
                  <div
                    key={image.id}
                    className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-neutral-100"
                  >
                    <Image
                      src={getFeaturedWidgetImage(image.secure_url)}
                      alt={`Ảnh ${index + 1}`}
                      fill
                      unoptimized
                      sizes="(max-width: 640px) 50vw, 220px"
                      className="object-cover"
                    />

                    <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/10 opacity-80" />

                    {index === 0 && (
                      <span className="absolute left-2 top-2 rounded-full bg-sky-500 px-2 py-1 text-[10px] font-medium text-white shadow-sm">
                        <i className="fad fa-star mr-1" aria-hidden="true" />
                        Bìa
                      </span>
                    )}

                    <div className="absolute inset-x-2 bottom-2 flex items-center justify-between gap-1">
                      <div className="flex gap-1">
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, -1)}
                          disabled={busy || index === 0}
                          title="Đưa ảnh về trước"
                          className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-white/90 text-neutral-700 backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <i className="fad fa-chevron-left" aria-hidden="true" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMoveImage(index, 1)}
                          disabled={busy || index === activeStory.images.length - 1}
                          title="Đưa ảnh về sau"
                          className="flex size-6 cursor-pointer items-center justify-center rounded-full bg-white/90 text-neutral-700 backdrop-blur transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                        >
                          <i className="fad fa-chevron-right" aria-hidden="true" />
                        </button>
                      </div>

                      <div className="flex gap-1">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={() => handleSetCover(index)}
                            disabled={busy}
                            title="Đặt làm ảnh bìa"
                            className="flex size-6 cursor-pointer items-center justify-center rounded-lg bg-white/90 text-amber-500 backdrop-blur transition hover:bg-white disabled:opacity-50"
                          >
                            <i className="fad fa-star" aria-hidden="true" />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDeleteImage(image)}
                          disabled={busy}
                          title="Xóa ảnh vĩnh viễn"
                          className="flex size-6 cursor-pointer items-center justify-center rounded-lg bg-red-500/90 text-white backdrop-blur transition hover:bg-red-600 disabled:opacity-50"
                        >
                          <i className="fad fa-trash-can" aria-hidden="true" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-4 rounded-xl border border-dashed border-neutral-200 py-10 text-center text-sm text-neutral-500">
                {activeStory
                  ? "Story này chưa có ảnh. Hãy upload hoặc chọn ảnh có sẵn."
                  : "Tạo story mới, sau đó thêm một hoặc nhiều ảnh."}
              </div>
            )}

            {activeStory && (
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={handleDeleteStory}
                  disabled={busy}
                  className="cursor-pointer rounded-lg px-3 py-2 text-xs font-medium text-red-600 transition hover:bg-red-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <i className="fad fa-trash-can mr-1.5" aria-hidden="true" />
                  Xóa toàn bộ story
                </button>
              </div>
            )}
          </section>

          {pickerOpen && (
            <section className="mt-6 rounded-2xl border border-black/5 bg-neutral-50 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-neutral-800">
                    Ảnh trong vutruong_vn/featureds
                  </h3>
                  <p className="mt-0.5 text-xs text-neutral-500">
                    Ảnh đã gắn story sẽ bị khóa để tránh trùng lặp.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setLibraryAssets([]);
                    setNextCursor(null);
                    loadLibrary(true);
                  }}
                  disabled={loadingLibrary || busy}
                  title="Tải lại"
                  className="flex size-9 cursor-pointer items-center justify-center rounded-lg bg-white text-neutral-600 shadow-sm transition hover:text-neutral-900 disabled:opacity-50"
                >
                  <i
                    className={`fad fa-rotate ${loadingLibrary ? "animate-spin" : ""}`}
                    aria-hidden="true"
                  />
                </button>
              </div>

              {libraryAssets.length > 0 ? (
                <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {libraryAssets.map((asset) => {
                    const used = usedPublicIds.has(asset.public_id);
                    const selected = selectedPublicIds.has(asset.public_id);

                    return (
                      <div
                        key={asset.asset_id}
                        className={`group relative aspect-[3/4] overflow-hidden rounded-xl border-2 transition ${
                          selected
                            ? "border-sky-500 ring-2 ring-sky-100"
                            : used
                              ? "border-transparent opacity-55"
                              : "border-transparent hover:border-neutral-300"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => toggleAsset(asset)}
                          disabled={used || busy}
                          className="absolute inset-0 z-10 cursor-pointer disabled:cursor-not-allowed"
                          aria-label={
                            used
                              ? "Ảnh đã được sử dụng"
                              : selected
                                ? "Bỏ chọn ảnh"
                                : "Chọn ảnh"
                          }
                        />

                        <Image
                          src={getFeaturedWidgetImage(asset.secure_url)}
                          alt="Ảnh Cloudinary"
                          fill
                          unoptimized
                          sizes="140px"
                          className="object-cover"
                        />

                        {(used || selected) && (
                          <span
                            className={`absolute right-1.5 top-1.5 z-20 flex size-6 items-center justify-center rounded-full text-xs text-white shadow ${
                              used ? "bg-neutral-600" : "bg-sky-500"
                            }`}
                          >
                            <i
                              className={used ? "fad fa-lock" : "fad fa-check"}
                              aria-hidden="true"
                            />
                          </span>
                        )}

                        {!used && (
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              handleDeleteUnusedAsset(asset);
                            }}
                            disabled={busy}
                            title="Xóa ảnh khỏi Cloudinary"
                            className="absolute bottom-1.5 right-1.5 z-20 flex size-7 cursor-pointer items-center justify-center rounded-lg bg-red-500/90 text-xs text-white opacity-0 shadow transition hover:bg-red-600 group-hover:opacity-100 disabled:opacity-40"
                          >
                            <i className="fad fa-trash-can" aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 py-10 text-center text-sm text-neutral-500">
                  {loadingLibrary
                    ? "Đang tải thư viện ảnh..."
                    : "Thư mục featureds chưa có ảnh."}
                </div>
              )}

              <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  {nextCursor && (
                    <button
                      type="button"
                      onClick={() => loadLibrary(false)}
                      disabled={loadingLibrary || busy}
                      className="cursor-pointer rounded-lg bg-white px-3 py-2 text-xs text-neutral-700 shadow-sm transition hover:bg-neutral-100 disabled:opacity-50"
                    >
                      {loadingLibrary ? "Đang tải..." : "Tải thêm ảnh"}
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddSelectedAssets}
                  disabled={busy || selectedPublicIds.size === 0}
                  className="cursor-pointer rounded-lg bg-sky-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-sky-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Thêm {selectedPublicIds.size || ""} ảnh đã chọn
                </button>
              </div>
            </section>
          )}
        </div>

        {busy && (
          <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center bg-white/30 backdrop-blur-[1px]">
            <span className="flex items-center gap-2 rounded-full bg-black/80 px-4 py-2 text-xs text-white shadow-lg">
              <i className="fad fa-spinner-third animate-spin" aria-hidden="true" />
              Đang xử lý...
            </span>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}