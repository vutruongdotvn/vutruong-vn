import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const RAW_SECRET_KEY = process.env.SECRET_ENCRYPTION_KEY || "vutruong_default_secret_key_2026";

// 🔥 NÂNG CẤP: Tự động băm (hash) chuỗi từ .env thành đúng 32 bytes.
// Dù bạn nhập mật khẩu gì ở .env.local, hệ thống cũng tự chuyển đổi cho hợp lệ.
const ENCRYPTION_KEY = crypto.createHash('sha256').update(RAW_SECRET_KEY).digest();

// 🔥 HÀM MÃ HÓA (Dùng khi Thêm/Sửa mật khẩu)
export function encryptSecret(text: string): string {
  if (!text) return "";

  // Tạo vector khởi tạo (IV) ngẫu nhiên
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");

  // Format lưu vào Database: iv:authTag:encryptedText
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

// 🔓 HÀM GIẢI MÃ (Dùng khi Fetch dữ liệu về để Admin xem)
export function decryptSecret(encryptedData: string): string {
  if (!encryptedData) return "";

  try {
    const parts = encryptedData.split(":");
    // Nếu data không đúng format mã hóa (ví dụ data lưu dưới dạng text cũ), trả về nguyên gốc
    if (parts.length !== 3) return encryptedData;

    const [ivHex, authTagHex, encryptedText] = parts;
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      ENCRYPTION_KEY,
      Buffer.from(ivHex, "hex")
    );
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    console.error("❌ Lỗi giải mã dữ liệu mật:", error);
    return "********"; // Che giấu nếu giải mã thất bại để an toàn
  }
}