import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { requireAppAdmin } from "@/lib/server/requireAppAdmin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

export async function GET(req: Request) {
  try {
    const authorization = await requireAppAdmin(req);
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
