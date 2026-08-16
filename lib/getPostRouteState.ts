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

function createPostLookupClient(supabaseUrl: string, apiKey: string) {
  return createClient(supabaseUrl, apiKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function queryPostRouteState(
  supabaseUrl: string,
  apiKey: string,
  id: string
) {
  const client = createPostLookupClient(supabaseUrl, apiKey);

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

/**
 * Kiểm tra một route bài viết có tồn tại hay không.
 *
 * Lookup này chỉ chạy trên server và chỉ lấy hai trường id, visibility.
 * Nội dung, hình ảnh và metadata riêng tư không được đọc ở đây. Khi có secret
 * key, nó phân biệt được privacy/not-found; nếu thiếu key, anonymous lookup
 * vẫn giữ bài public hoạt động và từ chối bài privacy theo RLS.
 * `cache()` chỉ khử query trùng giữa page và generateMetadata trong cùng
 * một lượt render, không tạo cache dài hạn cho trạng thái bài viết.
 */
export const getPostRouteState = cache(
  async (id: string): Promise<PostRouteState | null> => {
    if (!isValidPostId(id)) return null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    const supabaseSecretKey =
      process.env.SUPABASE_SECRET_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        "[getPostRouteState] Missing public Supabase environment variables"
      );
    }

    // Ưu tiên lookup đặc quyền để phân biệt chính xác bài riêng tư và ID
    // không tồn tại. Nếu key thiếu/sai, route sẽ tự hạ xuống anonymous lookup:
    // bài public vẫn hoạt động, bài privacy bị từ chối (fail closed).
    if (supabaseSecretKey) {
      const privilegedResult = await queryPostRouteState(
        supabaseUrl,
        supabaseSecretKey,
        id
      );

      if (!privilegedResult.error) {
        return normalizeRouteState(privilegedResult.data, id);
      }

      console.error(
        "[getPostRouteState] Privileged lookup failed; using RLS-safe fallback:",
        {
          code: privilegedResult.error.code,
          message: privilegedResult.error.message,
        }
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
