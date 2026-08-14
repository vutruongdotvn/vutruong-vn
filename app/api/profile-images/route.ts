import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "admin@vutruong.vn"
).toLowerCase();

const ROOT_PREFIX = "vutruong_vn/";
const MAX_RESULTS = 60;
const LIBRARY_CACHE_TTL_MS = 30_000;
const FOLDER_PREFIXES = {
  posts: `${ROOT_PREFIX}posts/`,
  avatars: `${ROOT_PREFIX}avatars/`,
  covers: `${ROOT_PREFIX}covers/`,
  featureds: `${ROOT_PREFIX}featureds/`,
} as const;

type FolderFilter = keyof typeof FOLDER_PREFIXES;

type CloudinaryResource = {
  asset_id?: string;
  public_id?: string;
  secure_url?: string;
  width?: number;
  height?: number;
  format?: string;
  bytes?: number;
  created_at?: string;
};

type CloudinaryResourcesResult = {
  resources?: CloudinaryResource[];
  next_cursor?: string;
};

type CloudinaryErrorShape = {
  message?: unknown;
  http_code?: unknown;
  rate_limit_reset_at?: unknown;
  error?: {
    message?: unknown;
    http_code?: unknown;
    rate_limit_reset_at?: unknown;
  };
};

let adminApiCooldownUntil = 0;
const resourcesCache = new Map<
  string,
  { expiresAt: number; result: CloudinaryResourcesResult }
>();
const resourcesRequests = new Map<
  string,
  Promise<CloudinaryResourcesResult>
>();

function getBearerToken(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function hasCloudinaryConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

function parseRetryAt(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const milliseconds = value < 10_000_000_000 ? value * 1000 : value;
    return milliseconds > Date.now() ? milliseconds : null;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) && parsed > Date.now() ? parsed : null;
  }

  return null;
}

function parseRetryAtFromMessage(message: string) {
  const match = message.match(
    /Try again on\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}\s+UTC)/i
  );
  if (!match) return null;

  const normalized = match[1]
    .replace(/\s+UTC$/i, "Z")
    .replace(" ", "T");
  const parsed = Date.parse(normalized);
  return Number.isFinite(parsed) && parsed > Date.now() ? parsed : null;
}

function getCloudinaryError(error: unknown) {
  if (error && typeof error === "object") {
    const value = error as CloudinaryErrorShape;
    const message =
      typeof value.message === "string"
        ? value.message
        : typeof value.error?.message === "string"
          ? value.error.message
          : "Cloudinary không trả về thông tin lỗi.";
    const rawStatus = value.http_code ?? value.error?.http_code;
    const status =
      typeof rawStatus === "number" && rawStatus >= 400 && rawStatus <= 599
        ? rawStatus
        : 502;
    const retryAt =
      parseRetryAt(value.rate_limit_reset_at) ??
      parseRetryAt(value.error?.rate_limit_reset_at) ??
      parseRetryAtFromMessage(message);

    return { message, status, retryAt };
  }

  if (typeof error === "string" && error.trim()) {
    return {
      message: error,
      status: 502,
      retryAt: parseRetryAtFromMessage(error),
    };
  }

  return {
    message: "Lỗi Cloudinary không xác định.",
    status: 502,
    retryAt: null,
  };
}

function rateLimitResponse(retryTimestamp: number) {
  const retryAt = new Date(retryTimestamp).toISOString();
  const retryAfter = Math.max(
    1,
    Math.ceil((retryTimestamp - Date.now()) / 1000)
  );
  const localTime = new Intl.DateTimeFormat("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date(retryTimestamp));

  return NextResponse.json(
    {
      success: false,
      error: `Cloudinary đã hết quota Admin API. Vui lòng thử lại sau ${localTime} (giờ Việt Nam).`,
      retry_at: retryAt,
      retry_after: retryAfter,
    },
    {
      status: 429,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
        "Retry-After": String(retryAfter),
      },
    }
  );
}

async function getCloudinaryResources(
  requestKey: string,
  options: Record<string, string | number>
) {
  const cached = resourcesCache.get(requestKey);
  if (cached && cached.expiresAt > Date.now()) return cached.result;
  if (cached) resourcesCache.delete(requestKey);

  const existingRequest = resourcesRequests.get(requestKey);
  if (existingRequest) return existingRequest;

  const request = (
    cloudinary.api.resources(options) as Promise<CloudinaryResourcesResult>
  )
    .then((result) => {
      resourcesCache.set(requestKey, {
        result,
        expiresAt: Date.now() + LIBRARY_CACHE_TTL_MS,
      });
      return result;
    })
    .finally(() => {
      resourcesRequests.delete(requestKey);
    });

  resourcesRequests.set(requestKey, request);
  return request;
}

function isFolderFilter(value: string | null): value is FolderFilter {
  return Boolean(value && value in FOLDER_PREFIXES);
}

function getAssetFolder(publicId: string) {
  const folder = publicId.slice(ROOT_PREFIX.length).split("/")[0];
  return isFolderFilter(folder) ? folder : "other";
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
    console.error("Profile images API: Thiếu cấu hình Supabase.");
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
        {
          success: false,
          error: "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
        },
        { status: 401 }
      ),
    };
  }

  if (user.email?.toLowerCase() !== ADMIN_EMAIL) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Chỉ admin mới có quyền xem thư viện ảnh." },
        { status: 403 }
      ),
    };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, email, role, status")
    .eq("id", user.id)
    .maybeSingle();

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

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(req: Request) {
  try {
    const authorization = await requireApprovedAdmin(req);
    if (!authorization.ok) return authorization.response;

    if (!hasCloudinaryConfig()) {
      console.error("Profile images API: Thiếu cấu hình Cloudinary.");
      return NextResponse.json(
        { success: false, error: "Server chưa được cấu hình đầy đủ." },
        { status: 500 }
      );
    }

    // Sau khi Cloudinary báo hết quota, không gọi lại Admin API cho tới lúc
    // reset. Khóa này bảo vệ cả khi một client cũ vẫn gửi request liên tục.
    if (adminApiCooldownUntil > Date.now()) {
      return rateLimitResponse(adminApiCooldownUntil);
    }

    const searchParams = new URL(req.url).searchParams;
    const cursor = searchParams.get("cursor")?.trim() || null;
    const rawFolder = searchParams.get("folder")?.trim() || null;

    if (cursor && (cursor.length > 1024 || /[\u0000-\u001F]/.test(cursor))) {
      return NextResponse.json(
        { success: false, error: "Cursor không hợp lệ." },
        { status: 400 }
      );
    }

    if (rawFolder && !isFolderFilter(rawFolder)) {
      return NextResponse.json(
        { success: false, error: "Bộ lọc thư mục không hợp lệ." },
        { status: 400 }
      );
    }

    const folder = isFolderFilter(rawFolder) ? rawFolder : null;
    const prefix = folder ? FOLDER_PREFIXES[folder] : ROOT_PREFIX;
    const options: Record<string, string | number> = {
      resource_type: "image",
      type: "upload",
      prefix,
      max_results: MAX_RESULTS,
    };

    if (cursor) options.next_cursor = cursor;

    const requestKey = `${prefix}:${cursor ?? "first"}`;
    const result = await getCloudinaryResources(requestKey, options);
    adminApiCooldownUntil = 0;

    const assets = (result.resources ?? [])
      .filter(
        (resource) =>
          typeof resource.public_id === "string" &&
          resource.public_id.startsWith(prefix) &&
          typeof resource.secure_url === "string"
      )
      .map((resource) => ({
        asset_id: resource.asset_id || resource.public_id!,
        public_id: resource.public_id!,
        secure_url: resource.secure_url!,
        width: resource.width ?? null,
        height: resource.height ?? null,
        format: resource.format ?? null,
        bytes: resource.bytes ?? 0,
        created_at: resource.created_at || "",
        folder: getAssetFolder(resource.public_id!),
      }))
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    return NextResponse.json(
      {
        success: true,
        assets,
        next_cursor: result.next_cursor || null,
      },
      {
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  } catch (error: unknown) {
    const cloudinaryError = getCloudinaryError(error);
    console.error("Profile images API error:", cloudinaryError.message);

    if (cloudinaryError.status === 420 || cloudinaryError.status === 429) {
      adminApiCooldownUntil =
        cloudinaryError.retryAt ?? Date.now() + 60_000;
      return rateLimitResponse(adminApiCooldownUntil);
    }

    return NextResponse.json(
      {
        success: false,
        error: "Không thể tải thư viện ảnh vào lúc này.",
      },
      { status: cloudinaryError.status }
    );
  }
}
