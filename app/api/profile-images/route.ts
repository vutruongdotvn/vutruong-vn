import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "admin@vutruong.vn"
).toLowerCase();

const ROOT_PREFIX = "vutruong_vn/";
const MAX_RESULTS = 20;
const MAX_DELETE_ITEMS = 20;
const LIBRARY_CACHE_TTL_MS = 60_000;
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

type AdminProfile = {
  id: string;
  email: string | null;
  role: string | null;
  status: string | null;
  avatar: string | null;
  cover_image: string | string[] | null;
};

type ServerSupabaseClient = ReturnType<typeof createClient>;

type AdminAuthorization =
  | {
      ok: true;
      userId: string;
      profile: AdminProfile;
      supabase: ServerSupabaseClient;
    }
  | { ok: false; response: NextResponse };

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

function getManagedPublicIdFromUrl(value: unknown) {
  const url = Array.isArray(value) ? value[0] : value;
  if (typeof url !== "string") return null;

  try {
    const path = new URL(url).pathname;
    const rootIndex = path.indexOf(`/${ROOT_PREFIX}`);
    if (rootIndex === -1) return null;

    return decodeURIComponent(path.slice(rootIndex + 1)).replace(
      /\.[A-Za-z0-9]+$/,
      ""
    );
  } catch {
    return null;
  }
}

function getDeletePublicIds(value: unknown) {
  if (!Array.isArray(value)) return [];

  return [
    ...new Set(
      value
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(
          (item) =>
            item.length > 0 &&
            item.length <= 255 &&
            !item.includes("..") &&
            /^[A-Za-z0-9/_-]+$/.test(item) &&
            (item.startsWith(FOLDER_PREFIXES.covers) ||
              item.startsWith(FOLDER_PREFIXES.avatars))
        )
    ),
  ];
}

async function requireApprovedAdmin(
  req: Request
): Promise<AdminAuthorization> {
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
    .select("id, email, role, status, avatar, cover_image")
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

  return {
    ok: true,
    userId: user.id,
    profile: profile as AdminProfile,
    supabase,
  };
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

export async function DELETE(req: Request) {
  try {
    const authorization = await requireApprovedAdmin(req);
    if (!authorization.ok) return authorization.response;

    if (!hasCloudinaryConfig()) {
      return NextResponse.json(
        { success: false, error: "Server chưa được cấu hình đầy đủ." },
        { status: 500 }
      );
    }

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Dữ liệu xóa ảnh không hợp lệ." },
        { status: 400 }
      );
    }

    const rawPublicIds =
      body && typeof body === "object" && "public_ids" in body
        ? (body as { public_ids: unknown }).public_ids
        : null;

    if (!Array.isArray(rawPublicIds)) {
      return NextResponse.json(
        { success: false, error: "Thiếu danh sách public_id cần xóa." },
        { status: 400 }
      );
    }

    const normalizedPublicIds = [
      ...new Set(
        rawPublicIds
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
      ),
    ];
    const publicIds = getDeletePublicIds(rawPublicIds);

    if (
      publicIds.length === 0 ||
      publicIds.length !== normalizedPublicIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Chỉ được xóa ảnh trong thư mục covers hoặc avatars.",
        },
        { status: 400 }
      );
    }

    if (publicIds.length > MAX_DELETE_ITEMS) {
      return NextResponse.json(
        {
          success: false,
          error: `Chỉ được xóa tối đa ${MAX_DELETE_ITEMS} ảnh mỗi lần.`,
        },
        { status: 400 }
      );
    }

    const activePublicIds = new Set(
      [
        getManagedPublicIdFromUrl(authorization.profile.avatar),
        getManagedPublicIdFromUrl(authorization.profile.cover_image),
      ].filter((value): value is string => Boolean(value))
    );
    const activeRequestedIds = publicIds.filter((publicId) =>
      activePublicIds.has(publicId)
    );

    if (activeRequestedIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Không thể xóa ảnh đang được sử dụng. Hãy đổi sang ảnh khác trước.",
          active_public_ids: activeRequestedIds,
        },
        { status: 409 }
      );
    }

    const avatarPublicIds = publicIds.filter((publicId) =>
      publicId.startsWith(FOLDER_PREFIXES.avatars)
    );

    if (avatarPublicIds.length > 0) {
      const { data: historyRows, error: historyReadError } =
        await authorization.supabase
          .from("user_avatars")
          .select("id, public_id")
          .eq("user_id", authorization.userId)
          .in("public_id", avatarPublicIds);

      if (historyReadError) {
        return NextResponse.json(
          {
            success: false,
            error:
              "Không thể kiểm tra lịch sử avatar nên ảnh chưa bị xóa. Vui lòng kiểm tra RLS của user_avatars.",
          },
          { status: 409 }
        );
      }

      const historyIds = (historyRows ?? []).map((row) => row.id);

      if (historyIds.length > 0) {
        const { data: deletedRows, error: historyDeleteError } =
          await authorization.supabase
            .from("user_avatars")
            .delete()
            .in("id", historyIds)
            .select("id");

        if (
          historyDeleteError ||
          (deletedRows?.length ?? 0) !== historyIds.length
        ) {
          return NextResponse.json(
            {
              success: false,
              error:
                "RLS chưa cho phép xóa lịch sử avatar. Cloudinary chưa bị thay đổi.",
            },
            { status: 409 }
          );
        }
      }
    }

    const deletedPublicIds: string[] = [];
    const failedPublicIds: string[] = [];

    for (const publicId of publicIds) {
      try {
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
          invalidate: true,
        });

        if (result.result === "ok" || result.result === "not found") {
          deletedPublicIds.push(publicId);
        } else {
          failedPublicIds.push(publicId);
        }
      } catch (error) {
        failedPublicIds.push(publicId);
        console.error("Profile image delete failed:", {
          publicId,
          error: error instanceof Error ? error.message : "Lỗi không xác định",
        });
      }
    }

    resourcesCache.clear();

    if (failedPublicIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Một số ảnh chưa thể xóa khỏi Cloudinary.",
          deleted_public_ids: deletedPublicIds,
          failed_public_ids: failedPublicIds,
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: true, deleted_public_ids: deletedPublicIds },
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  } catch (error) {
    console.error(
      "Profile images delete API error:",
      error instanceof Error ? error.message : "Lỗi không xác định"
    );
    return NextResponse.json(
      { success: false, error: "Không thể xóa ảnh vào lúc này." },
      { status: 500 }
    );
  }
}
