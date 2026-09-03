import { isAuthSessionMissingError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

const POST_ID_PATTERN = /^\d{20}$/;

export type PrivatePostProfile = {
  name: string | null;
  avatar: string | null;
};

export type PrivatePostRecord = {
  id: string;
  user_id: string;
  visibility: "privacy";
  created_at: string;
  content: unknown;
  images: unknown;
  author_name?: unknown;
  author_avatar?: unknown;
  [key: string]: unknown;
};

export type PrivatePostAccessResult =
  | {
      status: "granted";
      post: PrivatePostRecord;
      profile: PrivatePostProfile | null;
    }
  | {
      status: "denied" | "not_found" | "unavailable";
      post: null;
      profile: null;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizePrivatePost(
  value: unknown,
  postId: string
): PrivatePostRecord | null {
  if (
    !isRecord(value) ||
    String(value.id) !== postId ||
    typeof value.user_id !== "string" ||
    !value.user_id ||
    value.visibility !== "privacy" ||
    typeof value.created_at !== "string" ||
    !value.created_at
  ) {
    return null;
  }

  return {
    ...value,
    id: postId,
    user_id: value.user_id,
    visibility: "privacy",
    created_at: value.created_at,
    content: value.content,
    images: value.images,
  };
}

/**
 * Xác minh session với Supabase Auth rồi query bằng chính JWT của browser.
 * RLS của posts vẫn là lớp quyết định quyền đọc cuối cùng.
 */
export async function resolvePrivatePostForAdmin(
  postId: string
): Promise<PrivatePostAccessResult> {
  const normalizedPostId = postId.trim();
  const denied: PrivatePostAccessResult = {
    status: "denied",
    post: null,
    profile: null,
  };
  const notFound: PrivatePostAccessResult = {
    status: "not_found",
    post: null,
    profile: null,
  };
  const unavailable: PrivatePostAccessResult = {
    status: "unavailable",
    post: null,
    profile: null,
  };

  if (!POST_ID_PATTERN.test(normalizedPostId)) return notFound;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      // Không có session là trạng thái khách bình thường. Các lỗi Auth khác
      // (mạng, cấu hình, dịch vụ) phải được báo là unavailable thay vì giả 404.
      if (isAuthSessionMissingError(authError)) return denied;

      console.error("[PrivatePost] Auth verification failed:", {
        name: authError.name,
        message: authError.message,
      });
      return unavailable;
    }

    if (!user) {
      return denied;
    }

    // Không tin email, metadata hoặc role/status từ profile. Registry UID ở
    // private.app_admins là nguồn quyền duy nhất và hoạt động đúng cho cả
    // staging lẫn production mà không cần viết cứng UID vào bundle client.
    const { data: isAdmin, error: authorizationError } = await supabase.rpc(
      "is_featured_approved_admin"
    );

    if (authorizationError) {
      console.error("[PrivatePost] Admin authorization failed:", {
        code: authorizationError.code,
        message: authorizationError.message,
      });
      return unavailable;
    }

    if (isAdmin !== true) {
      return denied;
    }

    const { data: postData, error: postError } = await supabase
      .from("posts")
      .select("*")
      .eq("id", normalizedPostId)
      .eq("visibility", "privacy")
      .maybeSingle();

    if (postError) {
      console.error("[PrivatePost] Post query failed:", {
        code: postError.code,
        message: postError.message,
      });
      return unavailable;
    }

    // Sau khi registry đã xác nhận admin, kết quả rỗng nghĩa là route không
    // còn trỏ tới một bài privacy. Tách trạng thái này khỏi lỗi hạ tầng để UI
    // có thể gọi notFound() mà không che giấu sự cố Supabase.
    if (!postData) return notFound;

    const post = normalizePrivatePost(postData, normalizedPostId);
    if (!post) return unavailable;

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("name, avatar")
      .eq("id", post.user_id)
      .maybeSingle();

    if (profileError) {
      console.error("[PrivatePost] Profile query failed:", {
        code: profileError.code,
        message: profileError.message,
      });
    }

    const profile =
      !profileError && isRecord(profileData)
        ? {
            name:
              typeof profileData.name === "string" ? profileData.name : null,
            avatar:
              typeof profileData.avatar === "string"
                ? profileData.avatar
                : null,
          }
        : null;

    return { status: "granted", post, profile };
  } catch (error: unknown) {
    console.error(
      "[PrivatePost] Resolution failed:",
      error instanceof Error ? error.message : "Unknown error"
    );
    return unavailable;
  }
}
