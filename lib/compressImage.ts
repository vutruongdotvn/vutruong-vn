import imageCompression from "browser-image-compression";

export async function compressImage(file: File) {
  const options = {
    maxSizeMB: 1, // giữ chất lượng cao
    maxWidthOrHeight: 1920, // không resize quá nhỏ
    useWebWorker: true,
  };

  return await imageCompression(file, options);
}