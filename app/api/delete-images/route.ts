console.log("API delete-images loaded");

import { NextResponse } from "next/server";
import crypto from "crypto";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { public_ids } = await req.json();

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const apiKey = process.env.CLOUDINARY_API_KEY!;
    const apiSecret = process.env.CLOUDINARY_API_SECRET!;

    const results: any[] = [];

    for (const public_id of public_ids) {
      const timestamp = Math.floor(Date.now() / 1000);

      // 🔥 SIGNATURE CHUẨN CHO destroy
      const signature = crypto
        .createHash("sha1")
        .update(`public_id=${public_id}&timestamp=${timestamp}${apiSecret}`)
        .digest("hex");

      const formData = new URLSearchParams();
      formData.append("public_id", public_id);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp.toString());
      formData.append("signature", signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      console.log("Delete result:", data); // 🔥 DEBUG
      results.push(data);
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error("Delete error:", err);
    return NextResponse.json(
      { success: false, error: "Delete failed" },
      { status: 500 }
    );
  }
}