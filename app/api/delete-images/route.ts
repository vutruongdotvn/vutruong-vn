import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "admin@vutruong.vn"
).toLowerCase();

const MAX_DELETE_ITEMS = 50;
const ALLOWED_PUBLIC_ID_PREFIXES = [
  "vutruong_vn/posts/",
  "vutruong_vn/avatars/",
  "vutruong_vn/covers/",
  "vutruong_vn/featureds/",
] as const;

function getBearerToken(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Lỗi không xác định";
}

function safeParseArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === "string");
  }

  if (typeof value !== "string") return [];

  try {
    const parsed: unknown = JSON.parse(value);
    return Array.isArray(parsed)
      ? parsed.filter((item): item is string => typeof item === "string")
      : [value];
  } catch {
    return [value];
  }
}

function isAllowedPublicId(publicId: string): boolean {
  if (
    publicId.length === 0 ||
    publicId.length > 255 ||
    publicId.includes("..") ||
    !/^[A-Za-z0-9/_-]+$/.test(publicId)
  ) {
    return false;
  }

  return ALLOWED_PUBLIC_ID_PREFIXES.some((prefix) =>
    publicId.startsWith(prefix)
  );
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
    console.error("Delete images API: Thiếu cấu hình Supabase.");
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
        { success: false, error: "Chỉ admin mới có quyền xóa hình ảnh." },
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
    console.error("Delete images API: Không thể xác minh profile admin.", {
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
      console.error("Delete images API: Thiếu cấu hình Cloudinary.");
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
        { success: false, error: "Dữ liệu xóa hình ảnh không hợp lệ." },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object" || !("public_ids" in body)) {
      return NextResponse.json(
        { success: false, error: "Thiếu danh sách public_ids." },
        { status: 400 }
      );
    }

    const publicIds = [
      ...new Set(
        safeParseArray((body as { public_ids: unknown }).public_ids)
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ];

    if (publicIds.length === 0) {
      return NextResponse.json(
        { success: false, error: "Không có public_id hợp lệ để xóa." },
        { status: 400 }
      );
    }

    if (publicIds.length > MAX_DELETE_ITEMS) {
      return NextResponse.json(
        {
          success: false,
          error: `Chỉ được xóa tối đa ${MAX_DELETE_ITEMS} hình ảnh mỗi lần.`,
        },
        { status: 400 }
      );
    }

    const invalidPublicIds = publicIds.filter(
      (publicId) => !isAllowedPublicId(publicId)
    );

    if (invalidPublicIds.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Có public_id nằm ngoài thư mục Cloudinary được phép.",
          invalid_public_ids: invalidPublicIds,
        },
        { status: 400 }
      );
    }

    const results: Array<{ id: string; result: string; error?: string }> = [];

    for (const publicId of publicIds) {
      try {
        const result = await cloudinary.uploader.destroy(publicId, {
          resource_type: "image",
          invalidate: true,
        });

        results.push({ id: publicId, result: result.result });
      } catch (error: unknown) {
        console.error("Delete images API: Cloudinary delete failed.", {
          publicId,
          error: getErrorMessage(error),
        });

        results.push({
          id: publicId,
          result: "error",
          error: "Không thể xóa hình ảnh này.",
        });
      }
    }

    const failedCount = results.filter(
      (item) => item.result === "error"
    ).length;

    return NextResponse.json(
      { success: failedCount === 0, results },
      { status: failedCount > 0 ? 207 : 200 }
    );
  } catch (error: unknown) {
    console.error("Delete images API error:", getErrorMessage(error));
    return NextResponse.json(
      { success: false, error: "Không thể xóa hình ảnh vào lúc này." },
      { status: 500 }
    );
  }
}
