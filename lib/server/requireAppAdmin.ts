import "server-only";

import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const MAX_BEARER_TOKEN_LENGTH = 8_192;

type AppAdminAuthorization =
  | {
      ok: true;
      supabase: SupabaseClient;
      user: User;
    }
  | {
      ok: false;
      response: NextResponse;
    };

function jsonError(status: number, error: string) {
  return NextResponse.json(
    { success: false, error },
    {
      status,
      headers: {
        "Cache-Control": "private, no-store, max-age=0",
      },
    }
  );
}

function getBearerToken(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  const match = authorization?.match(/^Bearer[ \t]+([^\s]+)[ \t]*$/i);
  const token = match?.[1] ?? "";

  if (!token || token.length > MAX_BEARER_TOKEN_LENGTH) return null;
  return token;
}

/**
 * Xác thực access token với Supabase Auth rồi kiểm tra quyền từ registry UID
 * private.app_admins thông qua RPC đã được harden ở migration giai đoạn 1.
 *
 * Hàm này không tin email, user_metadata hoặc profiles.role/status.
 */
export async function requireAppAdmin(
  req: Request
): Promise<AppAdminAuthorization> {
  const token = getBearerToken(req);

  if (!token) {
    return {
      ok: false,
      response: jsonError(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."),
    };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Admin authorization: Thiếu cấu hình Supabase.");
    return {
      ok: false,
      response: jsonError(500, "Server chưa được cấu hình đầy đủ."),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      ok: false,
      response: jsonError(401, "Phiên đăng nhập không hợp lệ hoặc đã hết hạn."),
    };
  }

  // Tên RPC cũ được giữ lại ở migration giai đoạn 1 để tương thích ứng dụng.
  // Bên trong RPC chỉ kiểm tra auth.uid() với private.app_admins.
  const { data: isAdmin, error: authorizationError } = await supabase.rpc(
    "is_featured_approved_admin"
  );

  if (authorizationError) {
    console.error("Admin authorization: Không thể xác minh quyền trong database.", {
      code: authorizationError.code,
    });
    return {
      ok: false,
      response: jsonError(503, "Không thể xác minh quyền truy cập lúc này."),
    };
  }

  if (isAdmin !== true) {
    return {
      ok: false,
      response: jsonError(403, "Tài khoản không có quyền quản trị."),
    };
  }

  return { ok: true, supabase, user };
}
