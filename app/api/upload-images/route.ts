import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // --- 1. KIỂM TRA BẢO MẬT BẰNG TOKEN ---
    const authHeader = req.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ success: false, error: "Unauthorized: Thiếu token" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    // Chặn nếu chưa đăng nhập
    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Vui lòng đăng nhập để thực hiện" }, { status: 401 });
    }

    // --- 2. ĐỌC THÔNG TIN FILE VÀ PHÂN QUYỀN ---
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const type = formData.get("type") as string; // Lấy type từ Client ("post" hoặc "avatar")

    if (!file) {
      return NextResponse.json({ success: false, error: "Không tìm thấy file" }, { status: 400 });
    }

    // Logic Phân Quyền: Nếu upload ảnh bài viết thì bắt buộc phải là Admin
    const adminEmail = process.env.ADMIN_EMAIL || "admin@vutruong.vn";
    if (type === "post" && user.email !== adminEmail) {
      console.warn(`🚨 ${user.email} cố gắng upload ảnh bài viết!`);
      return NextResponse.json({ success: false, error: "Chỉ Admin mới có quyền upload ảnh bài viết." }, { status: 403 });
    }

    // --- 3. XỬ LÝ UPLOAD LÊN CLOUDINARY (SIGNED) ---
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Chia folder trên Cloudinary để dễ quản lý
    const folder = type === "avatar" ? "vutruong_vn/avatars" : "vutruong_vn/posts";

    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: "image",
          folder: folder,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (err: any) {
    console.error("❌ Upload API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}