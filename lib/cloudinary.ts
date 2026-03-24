export async function uploadImage(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // ❗ CHẶN LỖI NGAY TỪ ĐẦU
  if (!cloudName || !uploadPreset) {
    console.error("ENV lỗi:", { cloudName, uploadPreset });
    throw new Error("Thiếu config Cloudinary");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset!);
  
  // 🔥 debug production
  console.log("UPLOAD DEBUG:", {
    cloudName,
    uploadPreset,
  });

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

  return data;
}