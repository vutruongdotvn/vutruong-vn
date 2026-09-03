import "server-only";

import { cache } from "react";
import { createClient } from "@supabase/supabase-js";
import {
  getPostRouteState,
  isValidPostId,
  type PostRouteVisibility,
} from "@/lib/getPostRouteState";

export type PostDetailProfile = {
  name: string | null;
  avatar: string | null;
};

export type PublicPostDetail = {
  id: string;
  user_id: string;
  visibility: "public";
  [key: string]: unknown;
};

export type PostDetailData = {
  postId: string;
  routeVisibility: PostRouteVisibility;
  initialPost: PublicPostDetail | null;
  initialProfile: PostDetailProfile | null;
};

function createPublicReadClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "[getPostDetailData] Missing public Supabase environment variables"
    );
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePublicPost(value: unknown, id: string): PublicPostDetail {
  if (
    !isRecord(value) ||
    String(value.id) !== id ||
    typeof value.user_id !== "string" ||
    !value.user_id ||
    value.visibility !== "public"
  ) {
    throw new Error(
      `[getPostDetailData] Invalid public post payload for ${id}`
    );
  }

  return value as PublicPostDetail;
}

function normalizeProfile(value: unknown): PostDetailProfile | null {
  if (!isRecord(value)) return null;

  return {
    name: typeof value.name === "string" ? value.name : null,
    avatar: typeof value.avatar === "string" ? value.avatar : null,
  };
}

/**
 * Chuẩn bị dữ liệu ban đầu dùng chung cho route chi tiết bài viết.
 *
 * Bài public được tải đầy đủ bằng anonymous client tuân theo RLS. Với bài
 * privacy, loader chỉ trả trạng thái route; nội dung vẫn được xác thực và tải
 * ở client bằng phiên đăng nhập admin như luồng hiện tại.
 */
export const getPostDetailData = cache(
  async (id: string): Promise<PostDetailData | null> => {
    if (!isValidPostId(id)) return null;

    const routeState = await getPostRouteState(id);
    if (!routeState) {
      // RLS cố ý làm cho bài privacy và ID không tồn tại giống nhau ở server.
      // Client chỉ có thể phân giải tiếp bằng JWT admin hợp lệ.
      return {
        postId: id,
        routeVisibility: "privacy",
        initialPost: null,
        initialProfile: null,
      };
    }

    if (routeState.visibility === "privacy") {
      return {
        postId: id,
        routeVisibility: routeState.visibility,
        initialPost: null,
        initialProfile: null,
      };
    }

    const client = createPublicReadClient();
    const { data: postData, error: postError } = await client
      .from("posts")
      .select("*")
      .eq("id", id)
      .eq("visibility", "public")
      .maybeSingle();

    if (postError) {
      throw new Error(
        `[getPostDetailData] ${postError.code || "POST_QUERY_FAILED"}: ${postError.message}`
      );
    }

    // Bài có thể vừa bị xóa hoặc chuyển sang privacy giữa hai truy vấn.
    if (!postData) return null;

    const post = normalizePublicPost(postData, id);
    const { data: profileData, error: profileError } = await client
      .from("profiles")
      .select("name, avatar")
      .eq("id", post.user_id)
      .maybeSingle();

    // Thiếu profile không làm hỏng bài viết; component đã có dữ liệu fallback.
    if (profileError) {
      console.error("[getPostDetailData] Profile query failed:", {
        code: profileError.code,
        message: profileError.message,
      });
    }

    return {
      postId: id,
      routeVisibility: routeState.visibility,
      initialPost: post,
      initialProfile: profileError ? null : normalizeProfile(profileData),
    };
  }
);
