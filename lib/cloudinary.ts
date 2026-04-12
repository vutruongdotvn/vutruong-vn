export const uploadImage = async (file: File) => {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      console.error("Cloudinary error:", data);
      throw new Error("Upload Cloudinary thất bại");
    }

    return {
      url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
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
    width: 50,
    height: 50,
    crop: "fill",
    gravity: "face",
    quality: "auto:eco",
    format: "auto",
    dpr: 1,
  });
}

// thumbnail feed / card
export function getFeedImage(url?: string) {
  return buildCloudinaryImage(url, {
    width: 600,
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
    width: 1200,
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


{/*
// ⚠️ deprecated - không dùng nữa để tránh double transform
export function cloudinaryLoader({
  src,
  width,
  quality,
}: CloudinaryLoaderParams) {
  if (!src.includes("res.cloudinary.com")) return src;

  const q = quality || "auto";

  return buildCloudinaryImage(src, {
    width,
    crop: "limit",
    quality: typeof q === "number" ? q : "auto",
    format: "auto",
    dpr: 1,
    sharpen: true,
  });
}
*/}