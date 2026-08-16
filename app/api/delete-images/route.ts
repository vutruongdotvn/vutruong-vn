import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const ADMIN_EMAIL = (
  process.env.ADMIN_EMAIL || "admin@vutruong.vn"
).toLowerCase();

const MAX_DELETE_ITEMS = 50;

/**
 * Các ký tự Cloudinary không cho phép trong public_id.
 *
 * Không whitelist folder.
 * Không whitelist ASCII.
 *
 * public_id có thể là:
 *
 *   abc123
 *   old-image
 *   ảnh-cũ-2024
 *   photo.v2
 *   vutruong_vn/posts/abc123
 *   legacy-folder/abc123
 *
 * API chỉ cần public_id thật của Cloudinary.
 */
const FORBIDDEN_PUBLIC_ID_CHARS = /[?&#\\%<>+]/u;

function getBearerToken(req: Request): string | null {
  const authorization = req.headers.get("authorization");
  const match = authorization?.match(/^Bearer\s+(.+)$/i);

  return match?.[1]?.trim() || null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error
    ? error.message
    : "Lỗi không xác định";
}

/**
 * Chuẩn hóa public_ids.
 *
 * Hỗ trợ:
 *
 * public_ids: ["id1", "id2"]
 *
 * hoặc legacy:
 *
 * public_ids: '["id1","id2"]'
 *
 * hoặc:
 *
 * public_ids: "id1"
 */
function safeParseArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is string =>
        typeof item === "string"
    );
  }

  if (typeof value !== "string") {
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter(
        (item): item is string =>
          typeof item === "string"
      );
    }

    return [value];
  } catch {
    return [value];
  }
}

/**
 * Validate public_id theo nguyên tắc Cloudinary.
 *
 * QUAN TRỌNG:
 *
 * KHÔNG kiểm tra folder/prefix.
 *
 * Vì public_id không bắt buộc phải thuộc:
 *
 *   vutruong_vn/posts/
 *
 * Asset legacy nằm ở root hoặc folder cũ
 * vẫn phải có thể xóa được.
 */
function isValidPublicId(publicId: string): boolean {
  if (!publicId) {
    return false;
  }

  /**
   * Cloudinary giới hạn public_id tối đa 255 ký tự.
   */
  if (publicId.length > 255) {
    return false;
  }

  /**
   * Không nhận URL thay cho public_id.
   *
   * API này yêu cầu ID Cloudinary thật,
   * không phải secure_url.
   */
  if (/^https?:\/\//i.test(publicId)) {
    return false;
  }

  /**
   * public_id không được bắt đầu/kết thúc bằng slash.
   */
  if (
    publicId.startsWith("/") ||
    publicId.endsWith("/")
  ) {
    return false;
  }

  /**
   * Không nhận control characters.
   */
  if (/[\u0000-\u001F\u007F]/u.test(publicId)) {
    return false;
  }

  /**
   * Các ký tự Cloudinary không cho phép.
   */
  if (FORBIDDEN_PUBLIC_ID_CHARS.test(publicId)) {
    return false;
  }

  return true;
}

async function requireApprovedAdmin(
  req: Request
): Promise<
  | { ok: true }
  | {
      ok: false;
      response: NextResponse;
    }
> {
  const token = getBearerToken(req);

  if (!token) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error:
            "Unauthorized: Thiếu access token.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const supabaseAnonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
      "Delete images API: Thiếu cấu hình Supabase."
    );

    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error:
            "Server chưa được cấu hình đầy đủ.",
        },
        {
          status: 500,
        }
      ),
    };
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
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
    }
  );

  /**
   * Xác minh access token trực tiếp với Supabase Auth.
   */
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser(token);

  if (authError || !user) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error:
            "Phiên đăng nhập không hợp lệ hoặc đã hết hạn.",
        },
        {
          status: 401,
        }
      ),
    };
  }

  /**
   * Check email admin.
   */
  if (
    user.email?.trim().toLowerCase() !== ADMIN_EMAIL
  ) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error:
            "Chỉ admin mới có quyền xóa hình ảnh.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  /**
   * Check profile admin trong database.
   */
  const {
    data: profile,
    error: profileError,
  } = await supabase
    .from("profiles")
    .select("id, email, role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    console.error(
      "Delete images API: Không thể xác minh profile admin.",
      {
        code: profileError.code,
      }
    );
  }

  const isApprovedAdmin =
    !profileError &&
    profile !== null &&
    profile.email?.trim().toLowerCase() ===
      ADMIN_EMAIL &&
    profile.role?.trim().toLowerCase() ===
      "admin" &&
    profile.status?.trim().toLowerCase() ===
      "approved";

  if (!isApprovedAdmin) {
    return {
      ok: false,
      response: NextResponse.json(
        {
          success: false,
          error:
            "Tài khoản không có quyền admin đã được phê duyệt.",
        },
        {
          status: 403,
        }
      ),
    };
  }

  return {
    ok: true,
  };
}

function hasCloudinaryConfig(): boolean {
  return Boolean(
    process.env
      .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

cloudinary.config({
  cloud_name:
    process.env
      .NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,

  api_key:
    process.env.CLOUDINARY_API_KEY,

  api_secret:
    process.env.CLOUDINARY_API_SECRET,

  secure: true,
});

/**
 * Các result được xem là thành công.
 *
 * "not found" cũng được coi là thành công:
 *
 * Nếu database còn giữ public_id nhưng asset
 * Cloudinary đã bị xóa từ trước thì cleanup
 * không cần thất bại lần nữa.
 */
function isSuccessfulDeleteResult(
  result: string
): boolean {
  return (
    result === "ok" ||
    result === "not found"
  );
}

export async function POST(req: Request) {
  try {
    /**
     * ─────────────────────────────────────
     * 1. AUTHORIZATION
     * ─────────────────────────────────────
     */

    const authorization =
      await requireApprovedAdmin(req);

    if (!authorization.ok) {
      return authorization.response;
    }

    /**
     * ─────────────────────────────────────
     * 2. CLOUDINARY CONFIG
     * ─────────────────────────────────────
     */

    if (!hasCloudinaryConfig()) {
      console.error(
        "Delete images API: Thiếu cấu hình Cloudinary."
      );

      return NextResponse.json(
        {
          success: false,
          error:
            "Server chưa được cấu hình đầy đủ.",
        },
        {
          status: 500,
        }
      );
    }

    /**
     * ─────────────────────────────────────
     * 3. PARSE BODY
     * ─────────────────────────────────────
     */

    let body: unknown;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error:
            "Dữ liệu xóa hình ảnh không hợp lệ.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body ||
      typeof body !== "object" ||
      !("public_ids" in body)
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Thiếu danh sách public_ids.",
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ─────────────────────────────────────
     * 4. NORMALIZE PUBLIC IDS
     * ─────────────────────────────────────
     */

    const publicIds = [
      ...new Set(
        safeParseArray(
          (
            body as {
              public_ids: unknown;
            }
          ).public_ids
        )
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ];

    if (publicIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Không có public_id hợp lệ để xóa.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      publicIds.length >
      MAX_DELETE_ITEMS
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            `Chỉ được xóa tối đa ${MAX_DELETE_ITEMS} hình ảnh mỗi lần.`,
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ─────────────────────────────────────
     * 5. VALIDATE PUBLIC IDS
     * ─────────────────────────────────────
     *
     * Không kiểm tra folder.
     *
     * Một public_id có thể là:
     *
     * abc123
     *
     * hoặc:
     *
     * vutruong_vn/posts/abc123
     *
     * hoặc legacy:
     *
     * old-folder/abc123
     */

    const invalidPublicIds =
      publicIds.filter(
        (publicId) =>
          !isValidPublicId(publicId)
      );

    if (
      invalidPublicIds.length > 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Có public_id Cloudinary không hợp lệ.",

          invalid_public_ids:
            invalidPublicIds,
        },
        {
          status: 400,
        }
      );
    }

    /**
     * ─────────────────────────────────────
     * 6. DELETE CLOUDINARY ASSETS
     * ─────────────────────────────────────
     */

    const results: Array<{
      id: string;
      result: string;
      error?: string;
    }> = [];

    /**
     * Xóa tuần tự thay vì bắn tối đa 50 request
     * Cloudinary đồng thời.
     *
     * Với bài blog thông thường chỉ có vài ảnh,
     * cách này ổn định và dễ kiểm soát hơn.
     */
    for (const publicId of publicIds) {
      try {
        /**
         * QUAN TRỌNG:
         *
         * Cloudinary tìm asset bằng public_id.
         *
         * Không quan tâm asset đang:
         *
         * root
         *
         * vutruong_vn/posts/
         *
         * hay folder legacy khác.
         */
        const destroyResult =
          await cloudinary.uploader.destroy(
            publicId,
            {
              resource_type: "image",
              type: "upload",
              invalidate: true,
            }
          );

        const result =
          typeof destroyResult?.result ===
          "string"
            ? destroyResult.result
            : "unknown";

        if (
          !isSuccessfulDeleteResult(
            result
          )
        ) {
          console.error(
            "Delete images API: Cloudinary trả về trạng thái không thành công.",
            {
              publicId,
              result,
            }
          );
        }

        results.push({
          id: publicId,
          result,
        });
      } catch (error: unknown) {
        console.error(
          "Delete images API: Cloudinary delete failed.",
          {
            publicId,
            error:
              getErrorMessage(error),
          }
        );

        results.push({
          id: publicId,
          result: "error",
          error:
            "Không thể xóa hình ảnh này.",
        });
      }
    }

    /**
     * ─────────────────────────────────────
     * 7. BUILD RESULT
     * ─────────────────────────────────────
     */

    const successfulResults =
      results.filter((item) =>
        isSuccessfulDeleteResult(
          item.result
        )
      );

    const failedResults =
      results.filter(
        (item) =>
          !isSuccessfulDeleteResult(
            item.result
          )
      );

    const deletedPublicIds =
      successfulResults.map(
        (item) => item.id
      );

    const failedPublicIds =
      failedResults.map(
        (item) => item.id
      );

    /**
     * Không có lỗi.
     */
    if (failedResults.length === 0) {
      return NextResponse.json(
        {
          success: true,

          deleted_count:
            deletedPublicIds.length,

          deleted_public_ids:
            deletedPublicIds,

          results,
        },
        {
          status: 200,
        }
      );
    }

    /**
     * Có một số asset xóa thành công
     * và một số asset thất bại.
     */
    return NextResponse.json(
      {
        success: false,

        error:
          "Một số hình ảnh không thể xóa khỏi Cloudinary.",

        deleted_count:
          deletedPublicIds.length,

        failed_count:
          failedPublicIds.length,

        deleted_public_ids:
          deletedPublicIds,

        failed_public_ids:
          failedPublicIds,

        results,
      },
      {
        status: 207,
      }
    );
  } catch (error: unknown) {
    console.error(
      "Delete images API error:",
      getErrorMessage(error)
    );

    return NextResponse.json(
      {
        success: false,
        error:
          "Không thể xóa hình ảnh vào lúc này.",
      },
      {
        status: 500,
      }
    );
  }
}