import { supabase } from "@/lib/supabase";

export const uploadImage = async (
  file: File | Blob, 
  type: "post" | "avatar" = "post" // Mặc định là "post"
) => {
  try {
    // 1. Lấy token đăng nhập
    const { data: { session } } = await supabase.auth.getSession();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", type); // Gửi thêm loại ảnh để API biết đường phân quyền

    // 2. Gửi request lên Server API nội bộ
    const res = await fetch("/api/upload-images", {
      method: "POST",
      headers: {
        "Authorization": session ? `Bearer ${session.access_token}` : "",
      },
      body: formData,
    });

    const result = await res.json();

    if (!res.ok || !result.success) {
      console.error("Cloudinary error:", result);
      throw new Error(result.error || "Upload ảnh thất bại");
    }

    return {
      url: result.data.secure_url,
      public_id: result.data.public_id,
      width: result.data.width,
      height: result.data.height,
      format: result.data.format,
    };
  } catch (err) {
    console.error("Upload lỗi:", err);
    throw err;
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
};

export function buildCloudinaryImage(
  url?: string,
  options?: CloudinaryOptions
) {
  if (!url) return "/images/default.jpg";
  if (!url.includes("res.cloudinary.com")) return url;

  const width = options?.width;
  const height = options?.height;
  const crop = options?.crop ?? "limit";
  const quality = options?.quality ?? "auto";
  const format = options?.format ?? "auto";
  const dpr = options?.dpr ?? 1;
  const gravity = options?.gravity;
  const sharpen = options?.sharpen ?? false;

  const transforms: string[] = [
    `f_${format}`,
    `q_${quality === "auto" ? "auto:eco" : quality}`,
    `dpr_${dpr}`,
    "fl_strip_profile",
  ];

  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  if (crop) transforms.push(`c_${crop}`);
  if (gravity && crop === "fill") transforms.push(`g_${gravity}`);
  if (sharpen) transforms.push("e_sharpen:30");

  return url.replace("/upload/", `/upload/${transforms.join(",")}/`);
}

// avatar nhỏ
export function getAvatarImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 100,
    height: 100,
    crop: "fill",
    gravity: "face",
    quality: "auto",
    format: "auto",
    dpr: 1,
  });
}

// thumbnail feed / card
export function getFeedImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 800,
    crop: "limit",
    quality: "auto",
    format: "auto",
    dpr: 1,
    sharpen: true,
  });
}

// ảnh lớn cho lightbox / preview chất lượng cao
export function getLightboxImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 1600,
    crop: "limit",
    quality: "auto:good",
    format: "auto",
    dpr: 1,
  });
}

// tối ưu tài nguyên ảnh trong PostCard
export function extractCloudinaryMeta(url?: string) {
  if (!url || !url.includes("res.cloudinary.com")) return null;

  try {
    // Cloudinary không luôn nhét width/height vào URL gốc,
    // nên helper này chủ yếu để parse các URL đã transform nếu có.
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


// new
type CloudinaryLoaderParams = {
  src: string;
  width: number;
  quality?: number;
};

// avatar trong trang route app/profile và trong CoverSection
export function getProfileAvatar(url?: string) {
  return buildCloudinaryImage(url, {
    width: 144,
    height: 144,
    crop: "fill",
    gravity: "face",
    quality: "auto:good",
    format: "auto",
    dpr: "auto",
    sharpen: true,
  });
}

// ảnh PhotoWidget
export function getPhotoWidgetImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 200,          // grid 3x3 → ~100px mỗi ảnh trên mobile, 200–300px desktop
    height: 200,
    crop: "fill",
    gravity: "auto",
    quality: "auto:eco",
    format: "auto",
    dpr: 1,
    sharpen: true,
  });
}

