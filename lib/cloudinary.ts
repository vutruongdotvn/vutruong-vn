export const uploadImage = async (file: File) => {
  try {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!;

    console.log("UPLOAD DEBUG:", { cloudName, uploadPreset });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset); // ✅ QUAN TRỌNG

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
    };
  } catch (err) {
    console.error("Upload lỗi:", err);
    throw err;
  }
};