import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function safeParseArray(value: any): string[] {
  if (Array.isArray(value)) return value;

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [value];
    } catch {
      return [value];
    }
  }

  return [];
}

export async function POST(req: Request) {
  try {
    const { public_ids } = await req.json();

    const parsedIds = safeParseArray(public_ids)
      .map((id) => String(id).trim())
      .filter(Boolean);

    console.log("🚨 DELETE INPUT:", public_ids);
    console.log("🚨 PARSED IDS:", parsedIds);

    const results: any[] = [];

    for (const id of parsedIds) {
      const res = await cloudinary.uploader.destroy(id, {
        invalidate: true,
        resource_type: "image",
      });

      console.log("🔥 DESTROY:", id, res);

      results.push({
        id,
        result: res.result,
      });
    }

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (err: any) {
    console.error("❌ ERROR:", err);
    return NextResponse.json({
      success: false,
      error: err.message || "Lỗi server",
    });
  }
}