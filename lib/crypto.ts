import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const MASKED_SECRET = "********";
const ENCRYPTED_VALUE_PATTERN = /^[0-9a-f]{24}:[0-9a-f]{32}:[0-9a-f]+$/i;

function getEncryptionKey(): Buffer {
  const rawSecretKey = process.env.SECRET_ENCRYPTION_KEY;

  // Không bao giờ dùng khóa mặc định. Nếu Vercel/Supabase staging bị cấu hình
  // thiếu, fail closed thay vì âm thầm mã hóa bằng một khóa có trong source.
  if (!rawSecretKey) {
    throw new Error("SECRET_ENCRYPTION_KEY is not configured.");
  }

  // Giữ nguyên phép dẫn xuất SHA-256 hiện tại để ciphertext đang có tiếp tục
  // giải mã được; giai đoạn này không xoay khóa và không đổi định dạng dữ liệu.
  return crypto.createHash("sha256").update(rawSecretKey).digest();
}

// 🔥 HÀM MÃ HÓA (Dùng khi Thêm/Sửa mật khẩu)
export function encryptSecret(text: string): string {
  if (!text) return "";

  // Tạo vector khởi tạo (IV) ngẫu nhiên
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);

  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  
  const authTag = cipher.getAuthTag().toString("hex");

  // Format lưu vào Database: iv:authTag:encryptedText
  return `${iv.toString("hex")}:${authTag}:${encrypted}`;
}

// 🔓 HÀM GIẢI MÃ (Dùng khi Fetch dữ liệu về để Admin xem)
export function decryptSecret(encryptedData: string): string {
  if (!encryptedData) return "";

  // Không trả ngược dữ liệu legacy/malformed như plaintext. Dữ liệu không đúng
  // định dạng AES-GCM luôn bị che để tránh một bản ghi lỗi trở thành rò rỉ.
  if (
    !ENCRYPTED_VALUE_PATTERN.test(encryptedData) ||
    encryptedData.split(":")[2].length % 2 !== 0
  ) {
    return MASKED_SECRET;
  }

  // Lấy khóa trước khối catch để lỗi cấu hình không bị biến thành dữ liệu
  // giả "********"; API phải fail closed và báo lỗi cấu hình ở server.
  const encryptionKey = getEncryptionKey();

  try {
    const [ivHex, authTagHex, encryptedText] = encryptedData.split(":");
    const decipher = crypto.createDecipheriv(
      ALGORITHM,
      encryptionKey,
      Buffer.from(ivHex, "hex")
    );
    decipher.setAuthTag(Buffer.from(authTagHex, "hex"));

    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch {
    console.error("Không thể giải mã một trường dữ liệu mật.");
    return MASKED_SECRET;
  }
}
