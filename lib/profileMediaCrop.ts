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
    image.onload = async () => {
      try {
        if (typeof image.decode === "function") await image.decode();
      } catch {
        // Safari đôi lúc báo decode thất bại dù bitmap đã sẵn sàng. Chỉ từ
        // chối khi kích thước thật sự bằng 0.
      }

      if (image.naturalWidth > 0 && image.naturalHeight > 0) {
        resolve(image);
      } else {
        reject(new Error("Hình ảnh chưa được trình duyệt giải mã hoàn chỉnh."));
      }
    };
    image.onerror = () => reject(new Error("Không thể đọc hình ảnh đã chọn."));
    image.src = src;
  });
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: "image/webp" | "image/jpeg",
  quality: number
) {
  return new Promise<Blob>((resolve, reject) => {
    let settled = false;
    let timeout = 0;
    const finish = (blob: Blob | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);

      if (blob && blob.size > 0) resolve(blob);
      else reject(new Error("Trình duyệt không thể mã hóa ảnh sau khi cắt."));
    };
    timeout = window.setTimeout(() => {
      if (settled) return;
      settled = true;
      reject(new Error("Trình duyệt xử lý ảnh quá lâu. Vui lòng thử lại."));
    }, 30_000);

    try {
      canvas.toBlob(finish, mimeType, quality);
    } catch {
      window.clearTimeout(timeout);
      reject(new Error("Trình duyệt không hỗ trợ định dạng ảnh đầu ra."));
    }
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
  const sourceX = Math.max(
    0,
    Math.min(Math.round(crop.x), Math.max(0, image.naturalWidth - 1))
  );
  const sourceY = Math.max(
    0,
    Math.min(Math.round(crop.y), Math.max(0, image.naturalHeight - 1))
  );
  const sourceWidth = Math.max(
    1,
    Math.min(Math.round(crop.width), image.naturalWidth - sourceX)
  );
  const sourceHeight = Math.max(
    1,
    Math.min(Math.round(crop.height), image.naturalHeight - sourceY)
  );

  context.drawImage(
    image,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    0,
    0,
    outputWidth,
    outputHeight
  );

  const mimeType = options.mimeType ?? "image/webp";
  const quality = Math.min(Math.max(options.quality ?? 0.95, 0.8), 1);

  try {
    return await canvasToBlob(canvas, mimeType, quality);
  } catch (error) {
    if (mimeType === "image/webp") {
      // JPEG là fallback ổn định hơn trên một số phiên bản Safari/iOS.
      return canvasToBlob(canvas, "image/jpeg", Math.min(quality, 0.94));
    }

    throw error;
  }
}
