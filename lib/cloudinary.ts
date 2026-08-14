import { supabase } from "@/lib/supabase";

export type UploadImageType = "post" | "avatar" | "cover" | "featured";

export const uploadImage = async (
  file: File | Blob,
  type: UploadImageType = "post"
) => {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type);

    const res = await fetch("/api/upload-images", {
      method: "POST",
      headers: {
        Authorization: session ? `Bearer ${session.access_token}` : "",
      },
      body: formData,
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      console.error("Cloudinary error:", result);
      throw new Error(result.error || "Upload ảnh thất bại");
    }

    return {
      url: result.data.secure_url as string,
      public_id: result.data.public_id as string,
      width: result.data.width as number,
      height: result.data.height as number,
      format: result.data.format as string,
    };
  } catch (error) {
    console.error("Upload lỗi:", error);
    throw error;
  }
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
  options?: CloudinaryOptions
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
    width: 300,
    height: 300,
    crop: "fill",
    gravity: "face",
    quality: "auto:good",
    format: "auto",
    dpr: "auto",
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

// Nền blur chỉ dùng ảnh 160px, dpr_1 và chất lượng eco để giảm bandwidth/usage.
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
    width: 320,
    height: 220,
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
