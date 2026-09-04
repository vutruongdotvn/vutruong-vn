import "server-only";

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";

export type PostRouteVisibility = "public" | "privacy";

export type PostRouteState = {
  id: string;
  visibility: PostRouteVisibility;
};

// ID bài viết của VT Zone luôn là chuỗi gồm đúng 20 chữ số.
const POST_ID_PATTERN = /^\d{20}$/;

export function isValidPostId(id: string): boolean {
  return POST_ID_PATTERN.test(id);
}

function createPostLookupClient(supabaseUrl: string, anonKey: string) {
  return createClient(supabaseUrl, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function queryPostRouteState(
  supabaseUrl: string,
  anonKey: string,
  id: string
) {
  const client = createPostLookupClient(supabaseUrl, anonKey);

  return client
    .from("posts")
    .select("id, visibility")
    .eq("id", id)
    .maybeSingle();
}

function normalizeRouteState(
  data: { id: unknown; visibility: unknown } | null,
  id: string
): PostRouteState | null {
  if (!data) return null;

  // Kể cả khi cấu hình RLS vô tình hồi quy, route công khai cũng không được
  // truyền trạng thái privacy xuống response.
  if (data.visibility === "privacy") return null;

  if (data.visibility !== "public") {
    throw new Error(
      `[getPostRouteState] Invalid visibility for post ${id}`
    );
  }

  return {
    id: String(data.id),
    visibility: data.visibility,
  };
}

/**
 * Kiểm tra một route bài viết CÔNG KHAI có tồn tại hay không.
 *
 * Lookup này chỉ dùng anon key và tuân theo RLS. Bài riêng tư và ID không tồn
 * tại đều trả về null, vì vậy route server không tạo oracle tiết lộ sự tồn tại
 * của nội dung riêng tư. Việc đọc bài riêng tư diễn ra ở browser bằng JWT đã
 * xác thực của admin và vẫn phải vượt qua RLS.
 * `cache()` chỉ khử query trùng giữa page và generateMetadata trong cùng
 * một lượt render, không tạo cache dài hạn cho trạng thái bài viết.
 */
export const getPostRouteState = cache(
  async (id: string): Promise<PostRouteState | null> => {
    if (!isValidPostId(id)) return null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "[getPostRouteState] Missing public Supabase environment variables"
      );
    }

    const publicResult = await queryPostRouteState(
      supabaseUrl,
      supabaseAnonKey,
      id
    );

    if (publicResult.error) {
      throw new Error(
        `[getPostRouteState] ${publicResult.error.code || "QUERY_FAILED"}: ${publicResult.error.message}`
      );
    }

    return normalizeRouteState(publicResult.data, id);
  }
);
