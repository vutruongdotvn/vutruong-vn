import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "admin@vutruong.vn"
).toLowerCase();

const FEATURED_PREFIX = "vutruong_vn/featureds/";
const MAX_RESULTS = 100;

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

function getBearerToken(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}

function hasCloudinaryConfig(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
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
    console.error("Featured images API: Thiếu cấu hình Supabase.");
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
      console.error("Featured images API: Thiếu cấu hình Cloudinary.");
      return NextResponse.json(
        { success: false, error: "Server chưa được cấu hình đầy đủ." },
        { status: 500 }
      );
    }

    const cursor = new URL(req.url).searchParams.get("cursor")?.trim() || null;

    if (cursor && (cursor.length > 1024 || /[\u0000-\u001F]/.test(cursor))) {
      return NextResponse.json(
        { success: false, error: "Cursor không hợp lệ." },
        { status: 400 }
      );
    }

    const options: Record<string, string | number> = {
      resource_type: "image",
      type: "upload",
      prefix: FEATURED_PREFIX,
      max_results: MAX_RESULTS,
    };

    if (cursor) options.next_cursor = cursor;

    const result = (await cloudinary.api.resources(
      options
    )) as CloudinaryResourcesResult;

    const assets = (result.resources ?? [])
      .filter(
        (resource) =>
          typeof resource.public_id === "string" &&
          resource.public_id.startsWith(FEATURED_PREFIX) &&
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
    console.error(
      "Featured images API error:",
      error instanceof Error ? error.message : "Lỗi không xác định"
    );

    return NextResponse.json(
      { success: false, error: "Không thể tải thư viện ảnh vào lúc này." },
      { status: 500 }
    );
  }
}
