export type CropAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

type CropOutputOptions = {
  maxWidth: number;
  maxHeight: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
};

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();

    // Cloudinary cho phép CORS; thuộc tính này giúp canvas không bị tainted
    // khi người dùng chọn một asset đã có trong thư viện.
    image.crossOrigin = "anonymous";
    image.referrerPolicy = "no-referrer";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Không thể đọc hình ảnh đã chọn."));
    image.src = src;
  });
}

export async function createCroppedImageBlob(
  imageSrc: string,
  crop: CropAreaPixels,
  options: CropOutputOptions
) {
  if (
    !Number.isFinite(crop.x) ||
    !Number.isFinite(crop.y) ||
    !Number.isFinite(crop.width) ||
    !Number.isFinite(crop.height) ||
    crop.width <= 0 ||
    crop.height <= 0
  ) {
    throw new Error("Vùng cắt ảnh không hợp lệ.");
  }

  const image = await loadImage(imageSrc);
  const scale = Math.min(
    1,
    options.maxWidth / crop.width,
    options.maxHeight / crop.height
  );
  const outputWidth = Math.max(1, Math.round(crop.width * scale));
  const outputHeight = Math.max(1, Math.round(crop.height * scale));
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    throw new Error("Trình duyệt không hỗ trợ xử lý ảnh bằng canvas.");
  }

  canvas.width = outputWidth;
  canvas.height = outputHeight;
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(
    image,
    Math.max(0, Math.round(crop.x)),
    Math.max(0, Math.round(crop.y)),
    Math.round(crop.width),
    Math.round(crop.height),
    0,
    0,
    outputWidth,
    outputHeight
  );

  const mimeType = options.mimeType ?? "image/webp";
  const quality = Math.min(Math.max(options.quality ?? 0.95, 0.8), 1);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Không thể tạo ảnh sau khi cắt."));
      },
      mimeType,
      quality
    );
  });
}
