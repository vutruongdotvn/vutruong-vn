import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

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
    // --- LỚP BẢO MẬT CẬP NHẬT ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    // CHỈ CẦN CÓ USER ĐĂNG NHẬP LÀ ĐƯỢC (Admin hay User thường đều OK)
    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Bạn cần đăng nhập để thực hiện hành động này." },
        { status: 401 }
      );
    }

    const isAdmin = user.email === "admin@vutruong.vn";
    if (isAdmin) {
      console.log("⚡ Admin action: Thực hiện xóa ảnh với quyền cao nhất.");
    } else {
      console.log(`👤 User action: ${user.email} đang thực hiện xóa ảnh cá nhân.`);
    }
    // --- KẾT THÚC LỚP BẢO MẬT ---

    // ... (Giữ nguyên logic Cloudinary bên dưới)

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
      results.push({ id, result: res.result });
    }

    return NextResponse.json({ success: true, results });
  } catch (err: any) {
    console.error("❌ ERROR:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi server" },
      { status: 500 }
    );
  }
}