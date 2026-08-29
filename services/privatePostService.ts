import { supabase } from "@/lib/supabase";

const ADMIN_USER_ID = "785f79e8-223a-41ea-a52d-dead8e2bf383";
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
      status: "denied" | "unavailable";
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
  const unavailable: PrivatePostAccessResult = {
    status: "unavailable",
    post: null,
    profile: null,
  };

  if (!POST_ID_PATTERN.test(normalizedPostId)) return unavailable;

  try {
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    // Không tin role/status từ profile cho quyền privacy.
    if (authError || !user || user.id !== ADMIN_USER_ID) {
      return { status: "denied", post: null, profile: null };
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

    // Rỗng khi RLS từ chối, bài bị xóa hoặc visibility vừa thay đổi.
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
