"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { useToast } from "@/hooks/useToast";
import { supabase } from "@/lib/supabase";
import {
  getProfileCropSource,
  getProfileLibraryThumbnail,
  uploadImage,
} from "@/lib/cloudinary";
import {
  deleteProfileCloudinaryAssets,
  deleteProfileLibraryAssets,
  fetchProfileCloudinaryAssets,
  invalidateProfileAssetsCache,
  profileMediaServiceError,
  type ProfileCloudinaryAsset,
  type ProfileMediaFolder,
} from "@/lib/profileMediaService";
import {
  createCroppedImageBlob,
  type CropAreaPixels,
} from "@/lib/profileMediaCrop";
import ProfileImageCropper, {
  type ProfileMediaKind,
} from "@/components/blog/cover/ProfileImageCropper";

type Props = {
  open: boolean;
  kind: ProfileMediaKind;
  profileId: string;
  currentUrl: string;
  onClose: () => void;
  onSaved: (url: string) => Promise<void> | void;
};

type SourceImage = {
  url: string;
  label: string;
  objectUrl: boolean;
};

const MAX_SOURCE_FILE_BYTES = 20 * 1024 * 1024;
const MAX_OUTPUT_FILE_BYTES = 20 * 1024 * 1024;

const FOLDER_OPTIONS: Array<{
  value: ProfileMediaFolder;
  label: string;
  icon: string;
}> = [
  { value: "all", label: "Tất cả", icon: "fa-images" },
  { value: "covers", label: "Ảnh bìa", icon: "fa-panorama" },
  { value: "avatars", label: "Avatar", icon: "fa-user-circle" },
  { value: "posts", label: "Bài viết", icon: "fa-newspaper" },
  { value: "featureds", label: "Tin nổi bật", icon: "fa-stars" },
];

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "—";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function formatAssetDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }).format(date);
}

function getManagedPublicId(url?: string) {
  if (!url) return null;

  try {
    const path = new URL(url).pathname;
    const rootIndex = path.indexOf("/vutruong_vn/");
    if (rootIndex === -1) return null;
    return decodeURIComponent(path.slice(rootIndex + 1)).replace(
      /\.[A-Za-z0-9]+$/,
      ""
    );
  } catch {
    return null;
  }
}

function createUploadRequestId() {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();

  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const value = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${value.slice(0, 4).join("")}-${value.slice(4, 6).join("")}-${value
    .slice(6, 8)
    .join("")}-${value.slice(8, 10).join("")}-${value.slice(10).join("")}`;
}

export default function ProfileMediaEditorModal({
  open,
  kind,
  profileId,
  currentUrl,
  onClose,
  onSaved,
}: Props) {
  const { showToast } = useToast();
  const showToastRef = useRef(showToast);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const busyRef = useRef(false);
  const onCloseRef = useRef(onClose);
  const loadingLibraryRef = useRef(false);
  const libraryRequestIdRef = useRef(0);
  const nextCursorRef = useRef<string | null>(null);
  const lastAutoLoadKeyRef = useRef<string | null>(null);
  const uploadRequestIdRef = useRef<string | null>(null);
  const deleteCandidateRef = useRef<ProfileCloudinaryAsset | null>(null);

  const [tab, setTab] = useState<"upload" | "library">("upload");
  const [source, setSource] = useState<SourceImage | null>(null);
  const [cropArea, setCropArea] = useState<CropAreaPixels | null>(null);
  const [saving, setSaving] = useState(false);
  const [folder, setFolder] = useState<ProfileMediaFolder>(
    kind === "avatar" ? "avatars" : "covers"
  );
  const [assets, setAssets] = useState<ProfileCloudinaryAsset[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [loadingLibrary, setLoadingLibrary] = useState(false);
  const [libraryError, setLibraryError] = useState<string | null>(null);
  const [deleteCandidate, setDeleteCandidate] =
    useState<ProfileCloudinaryAsset | null>(null);
  const [deletingPublicId, setDeletingPublicId] = useState<string | null>(null);
  const [reusingPublicId, setReusingPublicId] = useState<string | null>(null);

  const isAvatar = kind === "avatar";
  const title = isAvatar ? "Thay đổi ảnh đại diện" : "Thay đổi ảnh bìa";
  const reusableFolder = isAvatar ? "avatars" : "covers";
  const currentPublicId = useMemo(
    () => getManagedPublicId(currentUrl),
    [currentUrl]
  );

  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  useEffect(() => {
    busyRef.current = saving || deletingPublicId !== null;
  }, [deletingPublicId, saving]);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    deleteCandidateRef.current = deleteCandidate;
  }, [deleteCandidate]);

  const clearSource = useCallback(() => {
    setSource((current) => {
      if (current?.objectUrl) URL.revokeObjectURL(current.url);
      return null;
    });
    setCropArea(null);
    uploadRequestIdRef.current = null;
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  useEffect(() => {
    if (!open) return;

    setTab("upload");
    setFolder(kind === "avatar" ? "avatars" : "covers");
    setAssets([]);
    setNextCursor(null);
    setLibraryError(null);
    setDeleteCandidate(null);
    setDeletingPublicId(null);
    setReusingPublicId(null);
    nextCursorRef.current = null;
    lastAutoLoadKeyRef.current = null;
    libraryRequestIdRef.current += 1;
    loadingLibraryRef.current = false;
    clearSource();

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
      const currentPaddingRight =
        Number.parseFloat(window.getComputedStyle(body).paddingRight) || 0;
      body.style.paddingRight = `${currentPaddingRight + scrollbarWidth}px`;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || busyRef.current) return;

      if (deleteCandidateRef.current) {
        setDeleteCandidate(null);
      } else {
        onCloseRef.current();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      libraryRequestIdRef.current += 1;
      loadingLibraryRef.current = false;
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
  }, [clearSource, kind, open]);

  useEffect(() => {
    return () => {
      if (source?.objectUrl) URL.revokeObjectURL(source.url);
    };
  }, [source]);

  const loadLibrary = useCallback(
    async ({
      reset,
      requestedFolder,
      cursor,
    }: {
      reset: boolean;
      requestedFolder: ProfileMediaFolder;
      cursor?: string | null;
    }) => {
      if (loadingLibraryRef.current && !reset) return;

      const requestId = ++libraryRequestIdRef.current;
      loadingLibraryRef.current = true;
      setLoadingLibrary(true);
      setLibraryError(null);

      try {
        const result = await fetchProfileCloudinaryAssets({
          folder: requestedFolder,
          cursor: reset ? null : cursor,
        });

        if (requestId !== libraryRequestIdRef.current) return;

        setAssets((current) => {
          const combined = reset ? result.assets : [...current, ...result.assets];
          return Array.from(
            new Map(combined.map((asset) => [asset.public_id, asset])).values()
          );
        });
        setNextCursor(result.next_cursor);
        nextCursorRef.current = result.next_cursor;
      } catch (error) {
        if (requestId === libraryRequestIdRef.current) {
          const message = profileMediaServiceError(error);
          setLibraryError(message);
          showToastRef.current(message, "error");
        }
      } finally {
        if (requestId === libraryRequestIdRef.current) {
          loadingLibraryRef.current = false;
          setLoadingLibrary(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    if (!open || tab !== "library" || source) return;

    // Một key chỉ được tự động tải đúng một lần. Đây là lớp bảo vệ cứng
    // cho React Strict Mode/HMR và ngăn lỗi API tạo thành vòng lặp request.
    const autoLoadKey = `${kind}:${folder}`;
    if (lastAutoLoadKeyRef.current === autoLoadKey) return;

    const timer = window.setTimeout(() => {
      if (lastAutoLoadKeyRef.current === autoLoadKey) return;
      lastAutoLoadKeyRef.current = autoLoadKey;
      void loadLibrary({
        reset: true,
        requestedFolder: folder,
        cursor: null,
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [folder, kind, loadLibrary, open, source, tab]);

  const handleFolderChange = (value: ProfileMediaFolder) => {
    if (value === folder || saving) return;
    setDeleteCandidate(null);
    setAssets([]);
    setNextCursor(null);
    setLibraryError(null);
    nextCursorRef.current = null;
    setFolder(value);
  };

  const handleFile = (file?: File) => {
    if (!file || saving) return;

    if (!file.type.toLowerCase().startsWith("image/")) {
      showToast("Vui lòng chọn một file hình ảnh hợp lệ.", "warning");
      return;
    }

    if (file.size > MAX_SOURCE_FILE_BYTES) {
      showToast("Ảnh nguồn vượt quá dung lượng tối đa 20MB.", "warning");
      return;
    }

    clearSource();
    setSource({
      url: URL.createObjectURL(file),
      label: file.name || "Ảnh vừa chọn",
      objectUrl: true,
    });
  };

  const handleAsset = async (asset: ProfileCloudinaryAsset) => {
    if (saving || deletingPublicId) return;

    // Asset đã nằm đúng thư mục đích là một avatar/cover đã được chuẩn bị
    // trước đó. Cập nhật thẳng URL để reuse, không crop và không upload bản sao.
    if (asset.folder === reusableFolder) {
      if (asset.public_id === currentPublicId) {
        showToast("Ảnh này đang được sử dụng.", "warning");
        return;
      }

      setSaving(true);
      setReusingPublicId(asset.public_id);
      let reuseSucceeded = false;

      try {
        const field = isAvatar ? "avatar" : "cover_image";
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ [field]: asset.secure_url })
          .eq("id", profileId)
          .select("id")
          .single();

        if (updateError) {
          console.warn(
            "Profile media reuse update failed:",
            updateError.message
          );
          throw new Error(
            `Không thể sử dụng lại ${isAvatar ? "avatar" : "ảnh bìa"} này.`
          );
        }

        try {
          await onSaved(asset.secure_url);
        } catch (refreshError) {
          // Database đã cập nhật thành công; lỗi refetch tạm thời không được
          // biến thành lỗi reuse hoặc khiến người dùng bấm lại lần nữa.
          console.warn("Profile media reuse refresh failed:", refreshError);
        }
        reuseSucceeded = true;
        showToast(
          isAvatar
            ? "Đã sử dụng lại ảnh đại diện cũ."
            : "Đã sử dụng lại ảnh bìa cũ.",
          "success"
        );
      } catch (error) {
        showToast(profileMediaServiceError(error), "error");
      } finally {
        setReusingPublicId(null);
        setSaving(false);
      }

      if (reuseSucceeded) onClose();
      return;
    }

    // Ảnh từ posts/featureds hoặc khác loại vẫn cần tạo asset profile độc lập,
    // tránh avatar/cover bị mất khi asset nguồn bị xóa về sau.
    clearSource();
    setSource({
      url: getProfileCropSource(asset.secure_url, isAvatar ? 3072 : 4096),
      label: asset.public_id,
      objectUrl: false,
    });
  };

  const handleDeleteAsset = async () => {
    if (!deleteCandidate || deletingPublicId || saving) return;

    if (deleteCandidate.public_id === currentPublicId) {
      showToast("Hãy đổi sang ảnh khác trước khi xóa ảnh đang sử dụng.", "warning");
      setDeleteCandidate(null);
      return;
    }

    setDeletingPublicId(deleteCandidate.public_id);

    try {
      const deletedPublicIds = await deleteProfileLibraryAssets([
        deleteCandidate.public_id,
      ]);
      const deletedSet = new Set(deletedPublicIds);

      setAssets((current) =>
        current.filter((asset) => !deletedSet.has(asset.public_id))
      );
      setDeleteCandidate(null);
      showToast(
        deleteCandidate.folder === "avatars"
          ? "Đã xóa avatar cũ và dọn lịch sử liên quan."
          : "Đã xóa ảnh bìa cũ khỏi Cloudinary.",
        "success"
      );
    } catch (error) {
      showToast(profileMediaServiceError(error), "error");
    } finally {
      setDeletingPublicId(null);
    }
  };

  const handleCropAreaChange = useCallback(
    (area: CropAreaPixels | null) => setCropArea(area),
    []
  );

  const handleSave = async () => {
    if (!source || !cropArea || saving) return;

    setSaving(true);
    let uploadedPublicId: string | null = null;
    let profileUpdated = false;

    try {
      const blob = await createCroppedImageBlob(source.url, cropArea, {
        maxWidth: isAvatar ? 2048 : 4096,
        maxHeight: isAvatar ? 2048 : 1707,
        mimeType: "image/webp",
        quality: 0.95,
      });

      if (blob.size > MAX_OUTPUT_FILE_BYTES) {
        throw new Error("Ảnh sau khi cắt vượt quá dung lượng tối đa 20MB.");
      }

      const uploadRequestId =
        uploadRequestIdRef.current ?? createUploadRequestId();
      uploadRequestIdRef.current = uploadRequestId;
      const outputExtension = blob.type === "image/jpeg" ? "jpg" : "webp";
      const uploaded = await uploadImage(blob, kind, {
        requestId: uploadRequestId,
        filename: `${kind}-${uploadRequestId}.${outputExtension}`,
        retryOnce: true,
      });
      uploadedPublicId = uploaded.public_id;
      const field = isAvatar ? "avatar" : "cover_image";
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ [field]: uploaded.url })
        .eq("id", profileId)
        .select("id")
        .single();

      if (updateError) {
        console.warn("Profile media Supabase update failed:", updateError.message);
        throw new Error(
          `Ảnh đã upload nhưng chưa thể cập nhật ${
            isAvatar ? "avatar" : "ảnh bìa"
          } trong Supabase.`
        );
      }
      profileUpdated = true;

      let historyWarning = false;

      if (isAvatar) {
        const { error: historyError } = await supabase
          .from("user_avatars")
          .insert({
            user_id: profileId,
            url: uploaded.url,
            public_id: uploaded.public_id,
          });

        if (historyError) {
          historyWarning = true;
          console.warn("Avatar history sync error:", historyError.message);
        }
      }

      await onSaved(uploaded.url);
      invalidateProfileAssetsCache(isAvatar ? "avatars" : "covers");
      clearSource();
      onClose();
      showToast(
        historyWarning
          ? "Đã đổi avatar, nhưng lịch sử avatar chưa đồng bộ."
          : isAvatar
            ? "Đã cập nhật ảnh đại diện."
            : "Đã cập nhật ảnh bìa.",
        historyWarning ? "warning" : "success"
      );
    } catch (error) {
      if (uploadedPublicId && !profileUpdated) {
        try {
          await deleteProfileCloudinaryAssets([uploadedPublicId]);
        } catch (cleanupError) {
          console.error("Profile media cleanup error:", cleanupError);
        }
      }

      showToast(profileMediaServiceError(error), "error");
    } finally {
      setSaving(false);
    }
  };

  const folderLabel = useMemo(
    () => FOLDER_OPTIONS.find((item) => item.value === folder)?.label ?? "Tất cả",
    [folder]
  );

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/45 p-3 backdrop-blur-sm sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !saving &&
          !deletingPublicId &&
          !deleteCandidate
        ) {
          onClose();
        }
      }}
    >
      <div className="flex max-h-[94vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:rounded-3xl animate-fadeIn">
        <header className="flex shrink-0 items-center justify-between border-b border-black/5 px-4 py-3 sm:px-6 sm:py-4">
          <div className="min-w-0">
            <h2 className="truncate text-base font-semibold text-neutral-900 sm:text-lg">
              {title}
            </h2>
            <p className="mt-0.5 truncate text-xs text-neutral-500 sm:text-sm hidden">
              {source
                ? source.label
                : "Upload ảnh mới hoặc chọn lại ảnh đã có trên Cloudinary"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={saving || deletingPublicId !== null}
            aria-label="Đóng"
            className="ml-4 flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-neutral-100 text-neutral-600 transition hover:bg-neutral-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <i className="fad fa-xmark" aria-hidden="true" />
          </button>
        </header>

        <div className="overscroll-contain overflow-y-auto">
          {source ? (
            <div className="p-4 sm:p-6">
              <div className="mb-4 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={clearSource}
                  disabled={saving}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-neutral-100 px-3 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200 active:scale-95 disabled:opacity-50"
                >
                  <i className="fad fa-arrow-left" aria-hidden="true" />
                  Chọn ảnh khác
                </button>

                <span className="rounded-full bg-sky-50 px-3 py-1.5 text-xs font-medium text-sky-700">
                  {isAvatar ? "Tỷ lệ 1:1" : "Tỷ lệ 12:5"}
                </span>
              </div>

              <ProfileImageCropper
                image={source.url}
                kind={kind}
                disabled={saving}
                onCropAreaChange={handleCropAreaChange}
              />
            </div>
          ) : (
            <>
              <div className="sticky top-0 z-10 flex border-b border-black/5 bg-white/95 px-4 backdrop-blur sm:px-6">
                <button
                  type="button"
                  onClick={() => setTab("upload")}
                  disabled={saving}
                  className={`relative flex flex-1 cursor-pointer items-center justify-center gap-2 px-3 py-3.5 text-sm font-medium transition sm:flex-none sm:px-5 ${
                    tab === "upload"
                      ? "text-neutral-950"
                      : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  <i className="fad fa-cloud-arrow-up" aria-hidden="true" />
                  Tải ảnh mới
                  {tab === "upload" && (
                    <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-neutral-950" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setTab("library")}
                  disabled={saving}
                  className={`relative flex flex-1 cursor-pointer items-center justify-center gap-2 px-3 py-3.5 text-sm font-medium transition sm:flex-none sm:px-5 ${
                    tab === "library"
                      ? "text-neutral-950"
                      : "text-neutral-400 hover:text-neutral-700"
                  }`}
                >
                  <i className="fad fa-photo-film" aria-hidden="true" />
                  Thư viện
                  {tab === "library" && (
                    <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-neutral-950" />
                  )}
                </button>
              </div>

              {tab === "upload" ? (
                <div className="p-4 sm:p-8">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif,image/gif,image/heic,image/heif"
                    className="hidden"
                    onChange={(event) => handleFile(event.target.files?.[0])}
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group flex min-h-[320px] w-full cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-neutral-300 bg-gradient-to-b from-neutral-50 to-white p-8 text-center transition hover:border-sky-300 hover:from-sky-50/60 active:scale-[0.995]"
                  >
                    <span className="mb-5 flex size-16 items-center justify-center rounded-2xl bg-neutral-900 text-2xl text-white shadow-lg transition group-hover:-translate-y-0.5 group-hover:shadow-xl">
                      <i className="fad fa-image-circle-plus" aria-hidden="true" />
                    </span>
                    <span className="text-base font-semibold text-neutral-900">
                      Chọn hình ảnh từ thiết bị
                    </span>
                    <span className="mt-2 max-w-md text-sm leading-6 text-neutral-500">
                      Ảnh chỉ được upload sau khi bạn crop và xác nhận. Hỗ trợ JPG,
                      PNG, WebP, AVIF, HEIC/HEIF và tối đa 20MB.
                    </span>
                  </button>
                </div>
              ) : (
                <div className="p-4 sm:p-6">
                  <div className="mb-4 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {FOLDER_OPTIONS.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => handleFolderChange(item.value)}
                        disabled={saving}
                        className={`flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition active:scale-95 ${
                          folder === item.value
                            ? "bg-neutral-900 text-white"
                            : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                        }`}
                      >
                        <i className={`fad ${item.icon}`} aria-hidden="true" />
                        {item.label}
                      </button>
                    ))}
                  </div>

                  <div className="mb-3 flex items-center justify-between gap-3 text-[11px] text-neutral-400">
                    <span>Tải tối đa 10 ảnh mỗi lần</span>
                    {assets.length > 0 && <span>Đã tải {assets.length} ảnh</span>}
                  </div>

                  {loadingLibrary && assets.length === 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                      {Array.from({ length: 8 }).map((_, index) => (
                        <div
                          key={index}
                          className="aspect-[4/3] animate-pulse rounded-2xl bg-neutral-100"
                        />
                      ))}
                    </div>
                  ) : libraryError && assets.length === 0 ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl bg-amber-50 px-6 text-center">
                      <i className="fad fa-triangle-exclamation text-3xl text-amber-500" />
                      <p className="mt-3 max-w-lg text-sm font-medium leading-6 text-amber-900">
                        {libraryError}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          void loadLibrary({
                            reset: true,
                            requestedFolder: folder,
                            cursor: null,
                          })
                        }
                        className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-full bg-amber-900 px-4 py-2 text-xs font-medium text-white transition hover:bg-amber-800 active:scale-95"
                      >
                        <i className="fad fa-rotate-right" aria-hidden="true" />
                        Thử lại
                      </button>
                    </div>
                  ) : assets.length === 0 ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-3xl bg-neutral-50 text-center">
                      <i className="fad fa-images text-3xl text-neutral-300" />
                      <p className="mt-3 text-sm font-medium text-neutral-700">
                        Chưa có ảnh trong “{folderLabel}”
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
                      {assets.map((asset) => {
                        const isActive = asset.public_id === currentPublicId;
                        const canDelete =
                          asset.folder === "covers" || asset.folder === "avatars";
                        const isDeleting =
                          deletingPublicId === asset.public_id;
                        const isReusing =
                          reusingPublicId === asset.public_id;
                        const canReuseDirectly =
                          asset.folder === reusableFolder;

                        return (
                          <div
                            key={asset.asset_id}
                            title={asset.public_id}
                            className="group relative aspect-[4/3] cursor-pointer overflow-hidden rounded-2xl bg-neutral-100 text-left ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.98]"
                          >
                            <Image
                              src={getProfileLibraryThumbnail(asset.secure_url)}
                              alt=""
                              fill
                              unoptimized
                              loading="lazy"
                              fetchPriority="low"
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 240px"
                              className="object-cover transition duration-300 group-hover:scale-[1.03]"
                            />
                            <button
                              type="button"
                              onClick={() => void handleAsset(asset)}
                              disabled={saving || Boolean(deletingPublicId)}
                              aria-label={
                                canReuseDirectly
                                  ? `Sử dụng lại ${asset.public_id}`
                                  : `Chọn ${asset.public_id} để cắt`
                              }
                              className="absolute inset-0 z-[1] cursor-pointer disabled:cursor-wait"
                            />
                            <span className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-80" />
                            <span className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] flex items-end justify-between gap-2 p-2.5 text-[10px] text-white/85">
                              <span className="truncate">
                                {formatAssetDate(asset.created_at)}
                              </span>
                              <span className="shrink-0">
                                {formatBytes(asset.bytes)}
                              </span>
                            </span>
                            <span
                              className={`pointer-events-none absolute right-2 top-2 z-[2] flex size-8 items-center justify-center rounded-full bg-white/90 text-neutral-900 shadow-sm backdrop-blur transition ${
                                isReusing
                                  ? "opacity-100"
                                  : "opacity-0 group-hover:opacity-100"
                              }`}
                            >
                              <i
                                className={`fad ${
                                  isReusing
                                    ? "fa-spinner-third fa-spin"
                                    : canReuseDirectly
                                      ? "fa-check"
                                      : "fa-crop-simple"
                                }`}
                                aria-hidden="true"
                              />
                            </span>

                            {isActive ? (
                              <span className="pointer-events-none absolute left-2 top-2 z-[3] rounded-full bg-emerald-500 px-2.5 py-1.5 text-[10px] font-medium text-white shadow-sm">
                                Đang sử dụng
                              </span>
                            ) : canDelete ? (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setDeleteCandidate(asset);
                                }}
                                disabled={saving || Boolean(deletingPublicId)}
                                aria-label={`Xóa ${asset.public_id}`}
                                title="Xóa ảnh khỏi Cloudinary"
                                className="absolute left-2 top-2 z-[3] flex size-8 cursor-pointer items-center justify-center rounded-full bg-red-500/95 text-xs text-white opacity-100 shadow-sm backdrop-blur transition hover:bg-red-600 active:scale-90 disabled:cursor-wait disabled:opacity-50 sm:opacity-0 sm:group-hover:opacity-100"
                              >
                                <i
                                  className={`fad ${
                                    isDeleting
                                      ? "fa-spinner-third fa-spin"
                                      : "fa-trash"
                                  }`}
                                  aria-hidden="true"
                                />
                              </button>
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {nextCursor && (
                    <div className="mt-5 flex justify-center">
                      <button
                        type="button"
                        onClick={() =>
                          void loadLibrary({
                            reset: false,
                            requestedFolder: folder,
                            cursor: nextCursorRef.current,
                          })
                        }
                        disabled={loadingLibrary || saving}
                        className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-neutral-100 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <i
                          className={`fad ${
                            loadingLibrary ? "fa-spinner-third fa-spin" : "fa-images"
                          }`}
                          aria-hidden="true"
                        />
                        {loadingLibrary ? "Đang tải" : "Xem thêm 10 ảnh"}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {source && (
          <footer className="flex shrink-0 items-center justify-end gap-2 border-t border-black/5 bg-white px-4 py-3 sm:px-6 sm:py-4">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="cursor-pointer rounded-full bg-neutral-100 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200 active:scale-95 disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving || !cropArea}
              className="inline-flex min-w-32 cursor-pointer items-center justify-center gap-2 rounded-full bg-neutral-950 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-neutral-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <i
                className={`fad ${
                  saving ? "fa-spinner-third fa-spin" : "fa-check"
                }`}
                aria-hidden="true"
              />
              {saving ? "Đang lưu" : "Lưu ảnh"}
            </button>
          </footer>
        )}
      </div>

      {deleteCandidate && (
        <div
          className="absolute inset-0 z-[40] flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm"
          role="alertdialog"
          aria-modal="true"
          aria-label="Xác nhận xóa ảnh"
          onMouseDown={(event) => {
            if (
              event.target === event.currentTarget &&
              !deletingPublicId
            ) {
              setDeleteCandidate(null);
            }
          }}
        >
          <div className="w-full max-w-sm rounded-3xl bg-white p-5 text-center shadow-2xl sm:p-6">
            <span className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-red-50 text-xl text-red-500">
              <i className="fad fa-trash-can" aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-base font-semibold text-neutral-950">
              Xóa ảnh này?
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-500">
              Ảnh này sẽ bị xóa vĩnh viễn.
            </p>
            <p className="mt-2 truncate rounded-xl bg-neutral-50 px-3 py-2 text-[11px] text-neutral-400 hidden">
              {deleteCandidate.public_id}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              <button
                type="button"
                onClick={() => setDeleteCandidate(null)}
                disabled={Boolean(deletingPublicId)}
                className="cursor-pointer rounded-full bg-neutral-100 px-5 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-200 active:scale-95 disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteAsset()}
                disabled={Boolean(deletingPublicId)}
                className="inline-flex min-w-28 cursor-pointer items-center justify-center gap-2 rounded-full bg-red-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-red-600 active:scale-95 disabled:cursor-wait disabled:opacity-60"
              >
                <i
                  className={`fad ${
                    deletingPublicId
                      ? "fa-spinner-third fa-spin"
                      : "fa-trash"
                  }`}
                  aria-hidden="true"
                />
                {deletingPublicId ? "Đang xóa" : "Xóa ảnh"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>,
    document.body
  );
}