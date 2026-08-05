import imageCompression from "browser-image-compression";

type CompressOptions = {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  initialQuality?: number;
};

export async function compressImage(
  file: File,
  enableCompression = false,
  customOptions: CompressOptions = {}
): Promise<File> {
  if (!enableCompression || !file.type.startsWith("image/")) {
    return file;
  }

  const options = {
    maxSizeMB: customOptions.maxSizeMB ?? 10, // dung lượng tối đa của 1 ảnh
    maxWidthOrHeight: customOptions.maxWidthOrHeight ?? 4096, // kích thước ảnh phân giải 8K
    useWebWorker: true,
    initialQuality: customOptions.initialQuality ?? 1, // 100% chất lượng gốc
    alwaysKeepResolution: true,
  };

  try {
    const compressed = await imageCompression(file, options);

    return new File([compressed], file.name, {
      type: compressed.type || file.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("compressImage error:", error);
    return file;
  }
}