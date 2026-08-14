import { NextResponse } from "next/server";
import { v2 as cloudinary, type UploadApiResponse } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "admin@vutruong.vn"
).toLowerCase();

const UPLOAD_TARGETS = {
  post: "vutruong_vn/posts",
  avatar: "vutruong_vn/avatars",
  cover: "vutruong_vn/covers",
  featured: "vutruong_vn/featureds",
} as const;

type UploadTarget = keyof typeof UPLOAD_TARGETS;

const ALLOWED_IMAGE_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/heic",
  "image/heif",
]);

const ALLOWED_IMAGE_FORMATS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
  "heic",
  "heif",
];

const DEFAULT_MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

function getMaxImageSizeBytes(): number {
  const configuredValue = Number(process.env.MAX_IMAGE_UPLOAD_BYTES);

  if (Number.isSafeInteger(configuredValue) && configuredValue > 0) {
    return configuredValue;
  }

  return DEFAULT_MAX_IMAGE_SIZE_BYTES;
}

function isUploadTarget(value: FormDataEntryValue | null): value is UploadTarget {
  return typeof value === "string" && value in UPLOAD_TARGETS;
}

function getBearerToken(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Lỗi không xác định";
}

async function requireApprovedAdmin(
  req: Request
): Promise<{ ok: true } | { ok: false; response: NextResponse }> {
  const token = getBearerToken(req);

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Unauthorized: Thiếu access token." },
        { status: 401 }
      ),
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Upload image API: Thiếu cấu hình Supabase.");
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Server chưa được cấu hình đầy đủ." },
        { status: 500 }
      ),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: { headers: { Authorization: `Bearer ${token}` } },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn." },
        { status: 401 }
      ),
    };
  }

  if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Chỉ admin mới có quyền upload hình ảnh." },
        { status: 403 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error("Upload image API: Không thể xác minh profile admin.", {
      code: profileError.code,
    });
  }

  const isApprovedAdmin =
    !profileError &&
    profile !== null &&
    profile.email?.toLowerCase() === ADMIN_EMAIL &&
    profile.role?.toLowerCase() === "admin" &&
    profile.status?.toLowerCase() === "approved";

  if (!isApprovedAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error: "Tài khoản không có quyền admin đã được phê duyệt.",
        },
        { status: 403 }
      ),
    };
  }

  return { ok: true };
}

function hasCloudinaryConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const authorization = await requireApprovedAdmin(req);
    if (!authorization.ok) return authorization.response;

    if (!hasCloudinaryConfig()) {
      console.error("Upload image API: Thiếu cấu hình Cloudinary.");
      return NextResponse.json(
        { success: false, error: "Server chưa được cấu hình đầy đủ." },
        { status: 500 }
      );
    }

    let formData: FormData;

    try {
      formData = await req.formData();
    } catch {
      return NextResponse.json(
        { success: false, error: "Dữ liệu upload không hợp lệ." },
        { status: 400 }
      );
    }

    const fileValue = formData.get("file");
    const uploadTargetValue = formData.get("type");

    if (!(fileValue instanceof File)) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy file hình ảnh." },
        { status: 400 }
      );
    }

    if (!isUploadTarget(uploadTargetValue)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Loại upload không hợp lệ. Chỉ chấp nhận post, avatar, cover hoặc featured.",
        },
        { status: 400 }
      );
    }

    if (fileValue.size <= 0) {
      return NextResponse.json(
        { success: false, error: "File hình ảnh rỗng." },
        { status: 400 }
      );
    }

    if (!ALLOWED_IMAGE_MIME_TYPES.has(fileValue.type.toLowerCase())) {
      return NextResponse.json(
        { success: false, error: "Định dạng hình ảnh không được hỗ trợ." },
        { status: 415 }
      );
    }

    const maxImageSizeBytes = getMaxImageSizeBytes();

    if (fileValue.size > maxImageSizeBytes) {
      return NextResponse.json(
        {
          success: false,
          error: `Hình ảnh vượt quá dung lượng tối đa ${Math.floor(
            maxImageSizeBytes / 1024 / 1024
          )} MB.`,
        },
        { status: 413 }
      );
    }

    const arrayBuffer = await fileValue.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const folder = UPLOAD_TARGETS[uploadTargetValue];

    const result = await new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            resource_type: "image",
            folder,
            allowed_formats: ALLOWED_IMAGE_FORMATS,
            use_filename: false,
            unique_filename: true,
            overwrite: false,
          },
          (error, uploadResult) => {
            if (error) {
              reject(error);
              return;
            }

            if (!uploadResult) {
              reject(new Error("Cloudinary không trả về kết quả upload."));
              return;
            }

            resolve(uploadResult);
          }
        )
        .end(buffer);
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error: unknown) {
    console.error("Upload image API error:", getErrorMessage(error));
    return NextResponse.json(
      { success: false, error: "Không thể upload hình ảnh vào lúc này." },
      { status: 500 }
    );
  }
}
