import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    const { public_ids } = await req.json();

    console.log("🚨 DELETE:", public_ids);
const parsedIds =
  typeof public_ids === "string"
    ? JSON.parse(public_ids)
    : public_ids;
    const results: any[] = [];

    for (const id of parsedIds) {
  const res = await cloudinary.uploader.destroy(id, {
    invalidate: true,
  });


      console.log("🔥 DESTROY:", id, res);

      results.push(res);
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("❌ ERROR:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}