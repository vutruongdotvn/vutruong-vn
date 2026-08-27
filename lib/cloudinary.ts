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

type CloudinaryCrop =
  | "fill"
  | "lfill"
  | "fit"
  | "thumb"
  | "scale"
  | "limit"
  | "pad";

type CloudinaryGravity =
  | "auto"
  | "face"
  | "faces"
  | "center"
  | "north"
  | "north_east"
  | "east"
  | "south_east"
  | "south"
  | "south_west"
  | "west"
  | "north_west";

type CloudinaryQuality =
  | number
  | "auto"
  | "auto:low"
  | "auto:eco"
  | "auto:good"
  | "auto:best";

type CloudinaryOptions = {
  width?: number;
  height?: number;
  quality?: CloudinaryQuality;
  crop?: CloudinaryCrop;
  format?: "webp" | "auto" | "avif" | "jpg" | "png";
  gravity?: CloudinaryGravity;
  sharpen?: boolean;
  blur?: number;
  stripProfile?: boolean;
};

function normalizeDimension(value?: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0) {
    return undefined;
  }

  return Math.round(value);
}

function normalizeQuality(quality: CloudinaryQuality) {
  if (typeof quality !== "number") return quality;
  return Math.min(Math.max(Math.round(quality), 1), 100);
}

/**
 * Tạo URL delivery của Cloudinary từ URL gốc.
 *
 * Quy ước chung của VT Zone:
 * - Mặc định xuất WebP để mọi preset có định dạng ổn định và dễ kiểm soát.
 * - Không dùng dpr_auto. Mỗi khu vực tự khai báo đúng kích thước output cần tải.
 * - Resize được thực hiện trước; blur/sharpen, format và quality là các bước nối
 *   tiếp theo để Cloudinary xử lý đúng thứ tự.
 * - c_limit và c_lfill không phóng lớn ảnh nhỏ hơn kích thước yêu cầu.
 * - Ảnh không thuộc res.cloudinary.com được giữ nguyên, không sửa URL bên ngoài.
 */
export function buildCloudinaryImage(
  url?: string,
  options?: CloudinaryOptions,
) {
  if (!url) return "/images/default.jpg";
  if (!url.includes("res.cloudinary.com") || !url.includes("/upload/")) {
    return url;
  }

  const width = normalizeDimension(options?.width);
  const height = normalizeDimension(options?.height);
  const crop = options?.crop ?? "limit";
  const gravity = options?.gravity;
  const quality = normalizeQuality(options?.quality ?? "auto:good");
  const format = options?.format ?? "webp";
  const sharpen = options?.sharpen ?? false;
  const blur = options?.blur;
  const stripProfile = options?.stripProfile ?? true;
  const components: string[] = [];
  const resize: string[] = [];

  if (crop) resize.push(`c_${crop}`);
  if (gravity && ["fill", "lfill", "thumb"].includes(crop)) {
    resize.push(`g_${gravity}`);
  }
  if (height) resize.push(`h_${height}`);
  if (width) resize.push(`w_${width}`);
  if (resize.length > 1) components.push(resize.join(","));

  if (sharpen) components.push("e_sharpen");
  if (typeof blur === "number" && Number.isFinite(blur) && blur > 0) {
    components.push(`e_blur:${Math.min(Math.round(blur), 2000)}`);
  }
  if (stripProfile) components.push("fl_strip_profile");

  // Cloudinary khuyến nghị format và quality là hai action tách riêng ở cuối.
  components.push(`f_${format}`, `q_${quality}`);

  return url.replace("/upload/", `/upload/${components.join("/")}/`);
}

/**
 * BlogPostFeed - ảnh nằm trong nội dung bài viết.
 * - width 800: đủ cho chiều rộng card feed, không tải ảnh master ngay từ đầu.
 * - c_limit: giữ nguyên tỷ lệ và tuyệt đối không phóng lớn ảnh nhỏ.
 * - q_auto:good: cân bằng độ nét với dung lượng khi đọc feed.
 * - f_webp: cố định đầu ra WebP.
 */
export function getBlogPostFeedImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 400,
    crop: "limit",
    quality: "auto:good",
    format: "webp",
  });
}

/**
 * BlogPostFeed - ảnh chỉ tải khi người dùng mở Fancybox.
 * - width 4096: giới hạn cạnh ngang tối đa 4K.
 * - c_limit: không upscale ảnh nguồn nhỏ hơn 4K.
 * - q_auto:best: ưu tiên chi tiết vì ảnh chỉ tải theo thao tác người dùng.
 */
export function getBlogPostFeedLightboxImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 2560,
    crop: "limit",
    quality: "auto:best",
    format: "webp",
  });
}

/**
 * BlogPostFeed/PostHeader - avatar tác giả hiển thị 80 x 80 px.
 * - c_fill: luôn lấp đầy khung vuông.
 * - g_face: ưu tiên giữ khuôn mặt ở trung tâm khi cần crop.
 * - Không có Fancybox và không dùng URL ảnh lớn.
 */
export function getPostHeaderAvatarImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 50,
    height: 50,
    crop: "fill",
    gravity: "face",
    quality: "auto",
    format: "webp",
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

/**
 * CoverSection - avatar chính hiển thị 200 x 200 px.
 * - c_fill + g_face: tạo khung vuông và giữ khuôn mặt.
 * - q_auto:good: đủ nét cho vùng nhận diện chính của Blog.
 */
export function getCoverSectionAvatarImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 200,
    height: 200,
    crop: "fill",
    gravity: "face",
    quality: "auto:good",
    format: "webp",
  });
}

/**
 * CoverSection - avatar chỉ tải khi mở Fancybox, tối đa 1024 x 1024 px.
 * - c_limit: giữ tỷ lệ và không phóng lớn ảnh nguồn nhỏ.
 * - q_auto:best + sharpen: ưu tiên độ nét khi xem kích thước lớn.
 */
export function getCoverSectionAvatarLightboxImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 900,
    height: 900,
    crop: "limit",
    quality: "auto:best",
    format: "webp",
  });
}

/**
 * CoverSection - ảnh bìa hiển thị trong layout, cạnh ngang tối đa 1200 px.
 * - Chỉ truyền width để Cloudinary tự giữ đúng tỷ lệ ảnh gốc.
 * - c_limit: không tải master và không upscale ảnh nhỏ.
 * - Tham số width cho phép hạ kích thước ở layout đặc biệt nhưng mặc định 1200.
 */
export function getCoverSectionCoverImage(url?: string, width = 1200) {
  return buildCloudinaryImage(url, {
    width,
    crop: "limit",
    quality: "auto:eco",
    format: "webp",
  });
}

/**
 * CoverSection - ảnh bìa chỉ tải khi mở Fancybox, cạnh ngang tối đa 4096 px.
 * - c_limit: giữ tỷ lệ và không upscale ảnh nhỏ hơn 4K.
 * - q_auto:best: bản xem lớn sắc nét nhưng vẫn được Cloudinary nén thông minh.
 */
export function getCoverSectionCoverLightboxImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 4096,
    crop: "limit",
    quality: "auto:best",
    format: "webp",
  });
}

/**
 * CoverSection/editor - ảnh nguồn chỉ tải sau khi admin chọn asset để crop.
 * - width tối đa 4096 để canvas crop có đủ dữ liệu ảnh.
 * - q_auto:best: hạn chế suy giảm trước khi canvas xử lý và upload lại.
 * - stripProfile false: không thêm fl_strip_profile vào URL nguồn của editor.
 * Đây không phải ảnh tải trong lượt render công khai thông thường.
 */
export function getCoverSectionCropSourceImage(url?: string, width = 4096) {
  return buildCloudinaryImage(url, {
    width,
    crop: "limit",
    quality: "auto:best",
    format: "webp",
    stripProfile: false,
  });
}

/**
 * CoverSection - nền blur trang trí phía sau ảnh bìa.
 * - width 160 + q_auto:low: output rất nhẹ vì không cần nhìn thấy chi tiết.
 * - blur 1000: làm mờ trực tiếp trên Cloudinary trước khi tải về trình duyệt.
 */
export function getCoverSectionBackgroundImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 160,
    crop: "limit",
    quality: "auto:low",
    format: "webp",
    blur: 1000,
  });
}

/**
 * CoverSection/editor - thumbnail avatar trong tab thư viện ảnh.
 * - 250 x 250, c_fill + g_face để khớp đúng preview avatar vuông.
 * - q_auto:eco vì đây chỉ là thumbnail chọn asset.
 */
export function getCoverSectionAvatarLibraryImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 250,
    height: 250,
    crop: "fill",
    gravity: "face",
    quality: "auto:eco",
    format: "webp",
  });
}

/**
 * CoverSection/editor - thumbnail ảnh bìa trong tab thư viện ảnh.
 * - 300 x 180: preview ngang nhẹ, không tải ảnh cover lớn.
 * - c_fill + g_auto: Cloudinary giữ vùng nội dung quan trọng khi crop preview.
 */
export function getCoverSectionCoverLibraryImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 300,
    height: 180,
    crop: "fill",
    gravity: "auto",
    quality: "auto:eco",
    format: "webp",
  });
}

/**
 * Sidebar/PhotoWidget - thumbnail ảnh bài viết 180 x 180 px.
 * - c_fill + g_auto: lấp đầy ô vuông và tự giữ chủ thể quan trọng.
 * - q_auto:eco: tối ưu bandwidth cho lưới nhiều thumbnail.
 * - Không có Fancybox; click thumbnail dẫn thẳng đến bài viết.
 */
export function getPhotoWidgetImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 180,
    height: 180,
    crop: "fill",
    gravity: "auto",
    quality: "auto:best",
    format: "webp",
  });
}

/**
 * Sidebar/FeaturedWidget - thumbnail Tin nổi bật, tỷ lệ 3:4.
 * - c_fill + g_auto: luôn khít card và ưu tiên vùng nội dung quan trọng.
 * - q_auto:good: giữ chi tiết tốt hơn PhotoWidget vì ảnh hiển thị lớn hơn.
 */
export function getFeaturedWidgetImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 180,
    crop: "fill",
    gravity: "auto",
    quality: "auto",
    format: "webp",
  });
}

/**
 * Sidebar/FeaturedWidget - ảnh chỉ tải khi mở Fancybox, rộng tối đa 1440 px.
 * - Chỉ giới hạn width để giữ nguyên tỷ lệ ảnh gốc, thường là 3:4.
 * - q_auto:best + sharpen: ưu tiên bản xem lớn rõ nét.
 */
export function getFeaturedWidgetLightboxImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 1440,
    crop: "limit",
    quality: "auto:best",
    format: "webp",
  });
}

/**
 * Route /blog/photos - thumbnail lưới ảnh 250 x 250 px.
 * - c_fill + g_auto: tất cả item đồng nhất hình vuông và giữ vùng nổi bật.
 * - q_auto:eco: giảm dung lượng khi một lần render nhiều item trong grid.
 * - Không có Fancybox; click ảnh dẫn đến trang bài viết chi tiết.
 */
export function getBlogPhotosGridImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 300,
    height: 300,
    crop: "fill",
    gravity: "auto",
    quality: "auto:eco",
    format: "webp",
  });
}

/**
 * Route /profile - thumbnail avatar cũ để quản lý/reuse/delete, 250 x 250 px.
 * - c_fill + g_face: preview avatar vuông và tập trung vào khuôn mặt.
 * - q_auto:good: đủ rõ để nhận diện avatar trước khi reuse hoặc delete.
 * - Không tạo URL Fancybox và không tải ảnh full-size.
 */
export function getProfileManagerAvatarImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 250,
    height: 250,
    crop: "fill",
    gravity: "face",
    quality: "auto:good",
    format: "webp",
  });
}

/**
 * Navbar/user dropdown - avatar tài khoản đăng nhập tối đa 100 x 100 px.
 * - Dùng preset riêng, không dùng chung avatar của PostHeader/CoverSection.
 * - c_fill + g_face: ổn định khung vuông ở cả desktop và mobile.
 * - Không có Fancybox và không tải URL ảnh lớn.
 */
export function getNavbarUserAvatarImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 100,
    height: 100,
    crop: "fill",
    gravity: "face",
    quality: "auto:good",
    format: "webp",
  });
}

/*
 * ---------------------------------------------------------------------------
 * Compatibility aliases
 * ---------------------------------------------------------------------------
 * Các export cũ được giữ tạm thời để việc thay riêng file này không làm vỡ
 * build. Component mới phải import các hàm theo đúng khu vực ở phía trên.
 * Sau khi toàn bộ import đã được chuyển đổi, có thể xóa khối alias này.
 */

/** @deprecated Dùng getPostHeaderAvatarImage hoặc getNavbarUserAvatarImage. */
export const getAvatarImage = getPostHeaderAvatarImage;

/** @deprecated Dùng getBlogPostFeedImage. */
export const getFeedImage = getBlogPostFeedImage;

/** @deprecated Dùng getBlogPostFeedLightboxImage. */
export const getLightboxImage = getBlogPostFeedLightboxImage;

/** @deprecated Dùng getCoverSectionAvatarImage. */
export const getProfileAvatar = getCoverSectionAvatarImage;

/** @deprecated Dùng getCoverSectionAvatarLightboxImage. */
export const getProfileAvatarLightbox = getCoverSectionAvatarLightboxImage;

/** @deprecated Dùng getCoverSectionCoverImage. */
export const getProfileCoverImage = getCoverSectionCoverImage;

/** @deprecated Dùng getCoverSectionCoverLightboxImage. */
export const getProfileCoverLightbox = getCoverSectionCoverLightboxImage;

/** @deprecated Dùng getCoverSectionCropSourceImage. */
export const getProfileCropSource = getCoverSectionCropSourceImage;

/** @deprecated Dùng getCoverSectionBackgroundImage. */
export const getProfileCoverBackground = getCoverSectionBackgroundImage;

/**
 * @deprecated Thư viện avatar và cover nay có hai preset riêng; component phải
 * chọn getCoverSectionAvatarLibraryImage hoặc getCoverSectionCoverLibraryImage.
 */
export const getProfileLibraryThumbnail =
  getCoverSectionCoverLibraryImage;
