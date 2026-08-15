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

function createPostLookupClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey =
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "[getPostRouteState] Missing NEXT_PUBLIC_SUPABASE_URL"
    );
  }

  if (!supabaseSecretKey) {
    throw new Error(
      "[getPostRouteState] Missing SUPABASE_SECRET_KEY or SUPABASE_SERVICE_ROLE_KEY"
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

/**
 * Kiểm tra một route bài viết có tồn tại hay không.
 *
 * Client đặc quyền này chỉ chạy trên server và chỉ lấy hai trường id,
 * visibility. Nội dung, hình ảnh và metadata riêng tư không được đọc ở đây.
 * `cache()` chỉ khử query trùng giữa page và generateMetadata trong cùng
 * một lượt render, không tạo cache dài hạn cho trạng thái bài viết.
 */
export const getPostRouteState = cache(
  async (id: string): Promise<PostRouteState | null> => {
    if (!isValidPostId(id)) return null;

    const supabaseAdmin = createPostLookupClient();
    const { data, error } = await supabaseAdmin
      .from("posts")
      .select("id, visibility")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      throw new Error(
        `[getPostRouteState] ${error.code || "QUERY_FAILED"}: ${error.message}`
      );
    }

    if (!data) return null;

    if (data.visibility !== "public" && data.visibility !== "privacy") {
      throw new Error(
        `[getPostRouteState] Invalid visibility for post ${id}`
      );
    }

    return {
      id: String(data.id),
      visibility: data.visibility,
    };
  }
);
