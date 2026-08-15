import { supabase } from "@/lib/supabase";

export type UploadImageType = "post" | "avatar" | "cover" | "featured";

type UploadImageOptions = {
  requestId?: string;
  filename?: string;
  retryOnce?: boolean;
};

type UploadApiPayload = {
  success?: boolean;
  error?: unknown;
  data?: {
    secure_url?: string;
    public_id?: string;
    width?: number;
    height?: number;
    format?: string;
  };
};

function readUploadError(value: unknown, depth = 0): string | null {
  if (depth > 3) return null;

  if (
    typeof value === "string" &&
    value.trim() &&
    value !== "[object Object]"
  ) {
    return value.trim();
  }

  if (value && typeof value === "object") {
    const object = value as { message?: unknown; error?: unknown };
    const message = readUploadError(object.message, depth + 1);
    if (message) return message;

    return readUploadError(object.error, depth + 1);
  }

  return null;
}

class UploadResponseError extends Error {
  retryable: boolean;

  constructor(message: string, retryable = false) {
    super(message);
    this.name = "UploadResponseError";
    this.retryable = retryable;
  }
}

function extensionFromMimeType(mimeType: string) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/png") return "png";
  if (mimeType === "image/avif") return "avif";
  if (mimeType === "image/gif") return "gif";
  return "webp";
}

async function parseUploadResponse(response: Response) {
  const rawBody = await response.text();
  let payload: UploadApiPayload | null = null;

  if (rawBody.trim()) {
    try {
      payload = JSON.parse(rawBody) as UploadApiPayload;
    } catch {
      // Safari dùng thông báo rất mơ hồ khi response.json() nhận HTML hoặc
      // JSON bị ngắt. Chuyển nó thành lỗi có ngữ cảnh và cho phép retry an toàn.
    }
  }

  if (!payload || typeof payload !== "object") {
    if (response.status === 413) {
      throw new UploadResponseError(
        "Ảnh vượt quá dung lượng mà máy chủ cho phép.",
        false,
      );
    }

    throw new UploadResponseError(
      response.ok
        ? "Phản hồi upload bị gián đoạn. Hệ thống sẽ thử lại một lần."
        : `Máy chủ upload tạm thời không phản hồi đúng định dạng (${response.status}).`,
      response.ok ||
        response.status === 408 ||
        response.status === 429 ||
        response.status >= 500,
    );
  }

  if (!response.ok || !payload.success) {
    throw new UploadResponseError(
      readUploadError(payload.error) ||
        "Không thể upload hình ảnh vào lúc này.",
      response.status === 408 ||
        response.status === 429 ||
        response.status >= 500,
    );
  }

  if (
    !payload.data ||
    typeof payload.data.secure_url !== "string" ||
    typeof payload.data.public_id !== "string"
  ) {
    throw new UploadResponseError(
      "Cloudinary không trả về đầy đủ thông tin ảnh. Hệ thống sẽ thử lại một lần.",
      true,
    );
  }

  return payload.data;
}

function isRetryableUploadError(error: unknown) {
  if (error instanceof UploadResponseError) return error.retryable;
  if (error instanceof DOMException) {
    return ["AbortError", "NetworkError", "SyntaxError"].includes(error.name);
  }
  return error instanceof TypeError;
}

export const uploadImage = async (
  file: File | Blob,
  type: UploadImageType = "post",
  options?: UploadImageOptions,
) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Phiên đăng nhập không hợp lệ hoặc đã hết hạn.");
  }

  const extension = extensionFromMimeType(file.type);
  const filename =
    options?.filename ||
    (file instanceof File && file.name ? file.name : `${type}.${extension}`);
  const maxAttempts = options?.requestId && options.retryOnce !== false ? 2 : 1;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const formData = new FormData();
    formData.append("file", file, filename);
    formData.append("type", type);
    if (options?.requestId) formData.append("request_id", options.requestId);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 120_000);

    try {
      const response = await fetch("/api/upload-images", {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        credentials: "same-origin",
        cache: "no-store",
        body: formData,
        signal: controller.signal,
      });
      const data = await parseUploadResponse(response);

      return {
        url: data.secure_url!,
        public_id: data.public_id!,
        width: data.width ?? 0,
        height: data.height ?? 0,
        format: data.format ?? extension,
      };
    } catch (error) {
      lastError = error;

      if (attempt + 1 >= maxAttempts || !isRetryableUploadError(error)) {
        break;
      }

      await new Promise((resolve) => window.setTimeout(resolve, 650));
    } finally {
      window.clearTimeout(timeout);
    }
  }

  console.warn("Upload image failed:", lastError);
  const lastMessage =
    lastError instanceof Error
      ? readUploadError(lastError.message)
      : readUploadError(lastError);
  throw new Error(
    lastError instanceof UploadResponseError && lastMessage
      ? lastMessage
      : "Kết nối bị gián đoạn khi upload ảnh. Vui lòng kiểm tra mạng và thử lại.",
  );
};

type CloudinaryCrop = "fill" | "fit" | "thumb" | "scale" | "limit" | "pad";

type CloudinaryOptions = {
  width?: number;
  height?: number;
  quality?: number | "auto" | "auto:eco" | "auto:good" | "auto:best";
  crop?: CloudinaryCrop;
  format?: "auto" | "webp" | "avif" | "jpg" | "png";
  dpr?: "auto" | number;
  gravity?: "auto" | "face" | "center";
  sharpen?: boolean;
  blur?: number;
  stripProfile?: boolean;
};

export function buildCloudinaryImage(
  url?: string,
  options?: CloudinaryOptions,
) {
  if (!url) return "/images/default.jpg";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  const width = options?.width;
  const height = options?.height;
  const crop = options?.crop ?? "limit";
  const quality = options?.quality ?? "auto:good";
  const format = options?.format ?? "auto";
  const dpr = options?.dpr ?? "auto";
  const gravity = options?.gravity;
  const sharpen = options?.sharpen ?? false;
  const blur = options?.blur;
  const stripProfile = options?.stripProfile ?? true;
  const transforms: string[] = [];

  if (format) transforms.push(`f_${format}`);
  if (quality) transforms.push(`q_${quality}`);
  if (dpr) transforms.push(`dpr_${dpr}`);
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);
  if (gravity && crop === "fill") transforms.push(`g_${gravity}`);
  if (sharpen) transforms.push("e_sharpen");
  if (typeof blur === "number" && blur > 0) {
    transforms.push(`e_blur:${Math.min(Math.round(blur), 2000)}`);
  }
  if (stripProfile) transforms.push("fl_strip_profile");

  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
}

export function getAvatarImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 200,
    height: 200,
    crop: "fill",
    gravity: "face",
    quality: "auto",
    format: "auto",
    dpr: "auto",
  });
}

export function getFeedImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 1000,
    crop: "limit",
    quality: "auto",
    format: "auto",
    dpr: "auto",
  });
}

export function getLightboxImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 4096,
    crop: "limit",
    quality: "auto:best",
    format: "auto",
    dpr: "auto",
  });
}

export function extractCloudinaryMeta(url?: string) {
  if (!url || !url.includes("res.cloudinary.com")) return null;

  try {
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) return null;

    const afterUpload = url.slice(uploadIndex + "/upload/".length);
    const firstSlash = afterUpload.indexOf("/");
    if (firstSlash === -1) return null;

    const transformPart = afterUpload.slice(0, firstSlash);
    const widthMatch = transformPart.match(/(?:^|,)w_(\d+)(?:,|$)/);
    const heightMatch = transformPart.match(/(?:^|,)h_(\d+)(?:,|$)/);
    const width = widthMatch ? Number(widthMatch[1]) : undefined;
    const height = heightMatch ? Number(heightMatch[1]) : undefined;

    if (!width && !height) return null;

    return {
      width: width ?? 1200,
      height: height ?? 900,
    };
  } catch {
    return null;
  }
}

export function getProfileAvatar(url?: string) {
  return buildCloudinaryImage(url, {
    width: 200,
    height: 200,
    crop: "fill",
    gravity: "face",
    quality: "auto:good",
    format: "auto",
    dpr: "auto",
  });
}

// URL chỉ dùng khi mở avatar bằng Fancybox. c_limit không phóng lớn ảnh nhỏ.
export function getProfileAvatarLightbox(url?: string) {
  return buildCloudinaryImage(url, {
    width: 1024,
    height: 1024,
    crop: "limit",
    quality: "auto:best",
    format: "auto",
    dpr: 1,
    sharpen: true,
  });
}

// Ảnh cover chính: đủ nét cho màn hình lớn nhưng không tải master full-size.
export function getProfileCoverImage(url?: string, width = 1920) {
  return buildCloudinaryImage(url, {
    width,
    crop: "limit",
    quality: "auto:good",
    format: "auto",
    dpr: 1,
    sharpen: true,
  });
}

// URL chỉ dùng khi mở cover bằng Fancybox; giữ tỷ lệ và giới hạn rộng 1920px.
export function getProfileCoverLightbox(url?: string) {
  return buildCloudinaryImage(url, {
    width: 1920,
    crop: "limit",
    quality: "auto:best",
    format: "auto",
    dpr: 1,
    sharpen: true,
  });
}

// Chỉ tải khi admin đã chọn một asset để crop. f_auto giúp đọc cả HEIC/HEIF
// từ Cloudinary trên các trình duyệt không hỗ trợ định dạng nguồn.
export function getProfileCropSource(url?: string, width = 4096) {
  return buildCloudinaryImage(url, {
    width,
    crop: "limit",
    quality: "auto:best",
    format: "auto",
    dpr: 1,
    stripProfile: false,
  });
}

// Nền blur chỉ dùng ảnh 320px, dpr_1 và chất lượng eco để giảm bandwidth/usage.
export function getProfileCoverBackground(url?: string) {
  return buildCloudinaryImage(url, {
    width: 160,
    crop: "limit",
    quality: "auto:eco",
    format: "auto",
    dpr: 1,
    blur: 1000,
  });
}

// Thumbnail dùng trong thư viện Cloudinary của trình chỉnh sửa profile.
export function getProfileLibraryThumbnail(url?: string) {
  return buildCloudinaryImage(url, {
    width: 280,
    height: 190,
    crop: "fill",
    gravity: "auto",
    quality: "auto:eco",
    format: "auto",
    dpr: 1,
  });
}

export function getPhotoWidgetImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 200,
    height: 200,
    crop: "fill",
    gravity: "auto",
    quality: "auto:eco",
    format: "auto",
    dpr: "auto",
  });
}

// Thumbnail 3:4 của Tin nổi bật. URL gốc vẫn được dùng khi mở Fancybox.
export function getFeaturedWidgetImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 300,
    height: 400,
    crop: "fill",
    gravity: "auto",
    quality: "auto:good",
    format: "auto",
    dpr: "auto",
  });
}
