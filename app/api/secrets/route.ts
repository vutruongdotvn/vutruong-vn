import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { encryptSecret, decryptSecret } from "@/lib/crypto";

export const runtime = "nodejs";

// Hàm helper check quyền Admin và khởi tạo Supabase mang quyền Admin
async function getAuthAdmin(req: Request) {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

  const token = authHeader.split(" ")[1];

  // 🔥 FIX RLS: Phải bơm trực tiếp Token vào global headers. 
  // Lúc này lệnh gọi Database mới hiểu đây là thao tác của Admin.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user || user.email !== "admin@vutruong.vn") return null;

  return supabase;
}

// LẤY DỮ LIỆU & GIẢI MÃ (GET)
export async function GET(req: Request) {
  try {
    const supabase = await getAuthAdmin(req);
    if (!supabase) return NextResponse.json({ success: false, error: "Forbidden: Truy cập bị từ chối" }, { status: 403 });

    const { data, error } = await supabase.from("secrets").select("*").order("created_at", { ascending: false });
    if (error) throw new Error(error.message);

    // Giải mã mật khẩu trước khi gửi về Client
    const decryptedData = data.map((item) => ({
      ...item,
      password: item.password ? decryptSecret(item.password) : "",
      secret_code: item.secret_code ? decryptSecret(item.secret_code) : "",
    }));

    return NextResponse.json({ success: true, data: decryptedData });
  } catch (err: any) {
    console.error("❌ Lỗi GET /api/secrets:", err);
    return NextResponse.json({ success: false, error: err.message || "Lỗi hệ thống" }, { status: 500 });
  }
}

// THÊM MỚI & MÃ HÓA (POST)
export async function POST(req: Request) {
  try {
    const supabase = await getAuthAdmin(req);
    if (!supabase) return NextResponse.json({ success: false, error: "Forbidden: Truy cập bị từ chối" }, { status: 403 });

    const body = await req.json();
    
    // Mã hóa trước khi lưu
    const encryptedPassword = body.password ? encryptSecret(body.password) : null;
    const encryptedCode = body.secret_code ? encryptSecret(body.secret_code) : null;

    const payload = { ...body, password: encryptedPassword, secret_code: encryptedCode };

    const { data, error } = await supabase.from("secrets").insert([payload]).select().single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("❌ Lỗi POST /api/secrets:", err);
    return NextResponse.json({ success: false, error: err.message || "Lỗi mã hóa hoặc hệ thống" }, { status: 500 });
  }
}

// CẬP NHẬT & MÃ HÓA (PUT)
export async function PUT(req: Request) {
  try {
    const supabase = await getAuthAdmin(req);
    if (!supabase) return NextResponse.json({ success: false, error: "Forbidden: Truy cập bị từ chối" }, { status: 403 });

    const body = await req.json();
    const { id, ...rest } = body;

    const encryptedPassword = rest.password ? encryptSecret(rest.password) : null;
    const encryptedCode = rest.secret_code ? encryptSecret(rest.secret_code) : null;

    const payload = { ...rest, password: encryptedPassword, secret_code: encryptedCode, updated_at: new Date().toISOString() };

    const { data, error } = await supabase.from("secrets").update(payload).eq("id", id).select().single();
    if (error) throw new Error(error.message);

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error("❌ Lỗi PUT /api/secrets:", err);
    return NextResponse.json({ success: false, error: err.message || "Lỗi cập nhật hoặc hệ thống" }, { status: 500 });
  }
}

// XÓA (DELETE)
export async function DELETE(req: Request) {
  try {
    const supabase = await getAuthAdmin(req);
    if (!supabase) return NextResponse.json({ success: false, error: "Forbidden: Truy cập bị từ chối" }, { status: 403 });

    const { id } = await req.json();
    const { error } = await supabase.from("secrets").delete().eq("id", id);
    
    if (error) throw new Error(error.message);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("❌ Lỗi DELETE /api/secrets:", err);
    return NextResponse.json({ success: false, error: err.message || "Lỗi xóa hệ thống" }, { status: 500 });
  }
}