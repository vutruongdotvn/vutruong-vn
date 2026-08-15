export type CropAreaPixels = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type ProfileMediaSourceKind = "cover" | "avatar";

type CropOutputOptions = {
  maxWidth: number;
  maxHeight: number;
  quality?: number;
  mimeType?: "image/webp" | "image/jpeg";
};

type DecodedImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
};

const IOS_COVER_SOURCE_MAX_SIDE = 3072;
const DEFAULT_COVER_SOURCE_MAX_SIDE = 4096;
const AVATAR_SOURCE_MAX_SIDE = 2048;

function isIOSWebKit() {
  if (typeof navigator === "undefined") return false;

  const userAgent = navigator.userAgent;
  const classicIOS = /iPad|iPhone|iPod/i.test(userAgent);
  const modernIPad =
    navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;

  return classicIOS || modernIPad;
}

function loadImage(src: string, crossOrigin = false) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();

    if (crossOrigin) image.crossOrigin = "anonymous";
    image.onload = () => {
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

async function decodeBlob(blob: Blob): Promise<DecodedImage> {
  if (typeof window.createImageBitmap === "function") {
    try {
      const bitmap = await window.createImageBitmap(blob, {
        imageOrientation: "from-image",
      });

      if (bitmap.width > 0 && bitmap.height > 0) {
        return {
          source: bitmap,
          width: bitmap.width,
          height: bitmap.height,
          release: () => bitmap.close(),
        };
      }

      bitmap.close();
    } catch {
      // Một số bản Safari không tạo được ImageBitmap từ HEIC/ảnh progressive.
      // Nhánh HTMLImageElement bên dưới vẫn đọc được các file do Photos cung cấp.
    }
  }

  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await loadImage(objectUrl);

    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => {
        image.onload = null;
        image.onerror = null;
        image.removeAttribute("src");
        URL.revokeObjectURL(objectUrl);
      },
    };
  } catch (error) {
    URL.revokeObjectURL(objectUrl);
    throw error;
  }
}

function releaseCanvas(canvas: HTMLCanvasElement) {
  // Giải phóng backing store ngay sau encode. Điều này đặc biệt quan trọng với
  // WebKit vì vùng nhớ canvas có thể được giữ lại tới khi garbage collection.
  canvas.width = 1;
  canvas.height = 1;
}

function addJpegBackground(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  context.save();
  context.globalCompositeOperation = "destination-over";
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, width, height);
  context.restore();
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: "image/webp" | "image/jpeg",
  quality: number,
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
    }, 45_000);

    try {
      canvas.toBlob(finish, mimeType, quality);
    } catch {
      window.clearTimeout(timeout);
      reject(new Error("Trình duyệt không hỗ trợ định dạng ảnh đầu ra."));
    }
  });
}

/**
 * Chuẩn hóa ảnh local quá lớn trước khi truyền cho react-easy-crop.
 *
 * iOS dùng ngưỡng 3072px cho cover để không giữ đồng thời nhiều bitmap 28MP.
 * Desktop vẫn giữ tối đa 4096px. Ảnh nhỏ, định dạng web phổ biến được giữ
 * nguyên để tránh encode lại không cần thiết.
 */
export async function normalizeProfileMediaFile(
  file: File,
  kind: ProfileMediaSourceKind,
) {
  const decoded = await decodeBlob(file);

  try {
    const maxSide =
      kind === "avatar"
        ? AVATAR_SOURCE_MAX_SIDE
        : isIOSWebKit()
          ? IOS_COVER_SOURCE_MAX_SIDE
          : DEFAULT_COVER_SOURCE_MAX_SIDE;
    const largestSide = Math.max(decoded.width, decoded.height);
    const scale = Math.min(1, maxSide / largestSide);
    const isBrowserFriendlyType = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/avif",
    ].includes(file.type.toLowerCase());

    if (scale === 1 && isBrowserFriendlyType) return file;

    const outputWidth = Math.max(1, Math.round(decoded.width * scale));
    const outputHeight = Math.max(1, Math.round(decoded.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = outputWidth;
    canvas.height = outputHeight;
    const context = canvas.getContext("2d", { alpha: false });

    if (!context) {
      releaseCanvas(canvas);
      throw new Error("Trình duyệt không hỗ trợ chuẩn hóa hình ảnh.");
    }

    try {
      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = "high";
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, outputWidth, outputHeight);
      context.drawImage(decoded.source, 0, 0, outputWidth, outputHeight);

      return await canvasToBlob(canvas, "image/jpeg", 0.93);
    } finally {
      releaseCanvas(canvas);
    }
  } finally {
    decoded.release();
  }
}

/** Safari/iOS ổn định hơn khi encode JPEG; Cloudinary vẫn phân phối f_auto. */
export function getProfileCropOutputMimeType(): "image/webp" | "image/jpeg" {
  return isIOSWebKit() ? "image/jpeg" : "image/webp";
}

export async function createCroppedImageBlob(
  imageSrc: string,
  crop: CropAreaPixels,
  options: CropOutputOptions,
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

  // Cloudinary cho phép CORS; local object URL cũng đọc bình thường với thuộc
  // tính anonymous. Không gọi image.decode() lần nữa sau onload trên Safari.
  const image = await loadImage(imageSrc, true);
  const scale = Math.min(
    1,
    options.maxWidth / crop.width,
    options.maxHeight / crop.height,
  );
  const outputWidth = Math.max(1, Math.round(crop.width * scale));
  const outputHeight = Math.max(1, Math.round(crop.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = outputWidth;
  canvas.height = outputHeight;
  const context = canvas.getContext("2d", { alpha: true });

  if (!context) {
    releaseCanvas(canvas);
    throw new Error("Trình duyệt không hỗ trợ xử lý ảnh bằng canvas.");
  }

  try {
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    const sourceX = Math.max(
      0,
      Math.min(Math.round(crop.x), Math.max(0, image.naturalWidth - 1)),
    );
    const sourceY = Math.max(
      0,
      Math.min(Math.round(crop.y), Math.max(0, image.naturalHeight - 1)),
    );
    const sourceWidth = Math.max(
      1,
      Math.min(Math.round(crop.width), image.naturalWidth - sourceX),
    );
    const sourceHeight = Math.max(
      1,
      Math.min(Math.round(crop.height), image.naturalHeight - sourceY),
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
      outputHeight,
    );

    const mimeType = options.mimeType ?? "image/webp";
    const quality = Math.min(Math.max(options.quality ?? 0.95, 0.8), 1);

    if (mimeType === "image/jpeg") {
      addJpegBackground(context, outputWidth, outputHeight);
    }

    try {
      return await canvasToBlob(canvas, mimeType, quality);
    } catch (error) {
      if (mimeType !== "image/webp") throw error;

      // WebP encoder có thể lỗi trên Safari dù trình duyệt đọc được WebP.
      addJpegBackground(context, outputWidth, outputHeight);
      return await canvasToBlob(canvas, "image/jpeg", Math.min(quality, 0.94));
    }
  } finally {
    image.onload = null;
    image.onerror = null;
    image.removeAttribute("src");
    releaseCanvas(canvas);
  }
}
