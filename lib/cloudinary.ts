export async function uploadToCloudinary(file: File) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  console.log("cloudName:", cloudName); // 👈 thêm dòng này
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "unsigned_upload");

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!data.secure_url) {
    console.error(data);
    throw new Error("Upload Cloudinary thất bại");
  }

  return {
    url: data.secure_url,
    public_id: data.public_id, // 🔥 QUAN TRỌNG để delete
  };
}
console.log("cloudName:", process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
console.log("uploadPreset:", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET);