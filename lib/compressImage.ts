import imageCompression from "browser-image-compression";

type CompressOptions = {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  initialQuality?: number;
};

export async function compressImage(
  file: File,
  customOptions: CompressOptions = {}
): Promise<File> {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  const options = {
    maxSizeMB: customOptions.maxSizeMB ?? 0.8,
    maxWidthOrHeight: customOptions.maxWidthOrHeight ?? 1600,
    useWebWorker: true,
    initialQuality: customOptions.initialQuality ?? 0.78,
    alwaysKeepResolution: false,
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