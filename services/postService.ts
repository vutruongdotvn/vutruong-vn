import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/cloudinary";
import { compressImage } from "@/lib/compressImage";

const DELETE_IMAGE_BATCH_SIZE = 50;

type UploadedImage = {
  url: string;
  public_id: string;
};

type OrderedImageItem =
  | {
      id: string;
      type: "existing";
      url: string;
      public_id: string;
    }
  | {
      id: string;
      type: "new";
      url: string;
      file: File;
    };

type DeleteImagesApiResponse = {
  success?: boolean;
  error?: string;
  failed_public_ids?: unknown;
  results?: Array<{
    id?: unknown;
    result?: unknown;
  }>;
};

function normalizeStringArray(value: unknown): string[] {
  let values: unknown[] = [];

  if (Array.isArray(value)) {
    values = value;
  } else if (typeof value === "string") {
    try {
      const parsed: unknown = JSON.parse(value);

      if (Array.isArray(parsed)) {
        values = parsed;
      } else if (typeof parsed === "string") {
        values = [parsed];
      } else {
        values = [value];
      }
    } catch {
      values = [value];
    }
  }

  return values
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizePublicIds(value: unknown): string[] {
  return [...new Set(normalizeStringArray(value))];
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Lỗi không xác định";
}

function getFailedPublicIds(
  data: DeleteImagesApiResponse | null,
  fallbackIds: string[]
): string[] {
  const explicitFailedIds = normalizePublicIds(data?.failed_public_ids);

  if (explicitFailedIds.length > 0) {
    return explicitFailedIds;
  }

  if (Array.isArray(data?.results)) {
    const failedFromResults = data.results
      .filter((item) => {
        const result = typeof item?.result === "string" ? item.result : "";
        return result !== "ok" && result !== "not found";
      })
      .map((item) => (typeof item?.id === "string" ? item.id.trim() : ""))
      .filter(Boolean);

    if (failedFromResults.length > 0) {
      return [...new Set(failedFromResults)];
    }
  }

  return fallbackIds;
}

/**
 * Gọi API xóa ảnh theo public_id.
 *
 * - Không phụ thuộc folder Cloudinary.
 * - Tự chia batch để không vượt giới hạn API.
 * - Không throw ra ngoài: caller tự quyết định cleanup là bắt buộc hay best-effort.
 */
async function deleteImagesViaApi(publicIds: unknown): Promise<{
  success: boolean;
  failedPublicIds: string[];
  error?: string;
}> {
  const ids = normalizePublicIds(publicIds);

  if (ids.length === 0) {
    return {
      success: true,
      failedPublicIds: [],
    };
  }

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.access_token) {
      return {
        success: false,
        failedPublicIds: ids,
        error: "Không tìm thấy phiên đăng nhập hợp lệ để xóa hình ảnh.",
      };
    }

    const failedPublicIds: string[] = [];

    for (let index = 0; index < ids.length; index += DELETE_IMAGE_BATCH_SIZE) {
      const batch = ids.slice(index, index + DELETE_IMAGE_BATCH_SIZE);

      try {
        const response = await fetch("/api/delete-images", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({ public_ids: batch }),
        });

        let data: DeleteImagesApiResponse | null = null;

        try {
          data = (await response.json()) as DeleteImagesApiResponse;
        } catch {
          data = null;
        }

        if (!response.ok || data?.success !== true) {
          failedPublicIds.push(...getFailedPublicIds(data, batch));
        }
      } catch (error: unknown) {
        console.error("Delete images API request failed:", {
          ids: batch,
          error: getErrorMessage(error),
        });

        failedPublicIds.push(...batch);
      }
    }

    const uniqueFailedIds = [...new Set(failedPublicIds)];

    return {
      success: uniqueFailedIds.length === 0,
      failedPublicIds: uniqueFailedIds,
      error:
        uniqueFailedIds.length > 0
          ? "Một số hình ảnh chưa được xóa khỏi Cloudinary."
          : undefined,
    };
  } catch (error: unknown) {
    console.error("Delete images helper failed:", getErrorMessage(error));

    return {
      success: false,
      failedPublicIds: ids,
      error: "Không thể gọi API xóa hình ảnh.",
    };
  }
}

async function rollbackUploadedImages(publicIds: unknown, context: string) {
  const ids = normalizePublicIds(publicIds);

  if (ids.length === 0) return;

  try {
    const cleanup = await deleteImagesViaApi(ids);

    if (!cleanup.success) {
      console.error(`${context}: Không thể rollback toàn bộ ảnh Cloudinary.`, {
        failedPublicIds: cleanup.failedPublicIds,
      });
    }
  } catch (error: unknown) {
    console.error(`${context}: Rollback ảnh phát sinh lỗi ngoài dự kiến.`, {
      error: getErrorMessage(error),
    });
  }
}

// tạo ID số ngẫu nhiên
function generateNumericId(length = 20) {
  let result = "";
  const digits = "0123456789";

  for (let i = 0; i < length; i++) {
    result += digits[Math.floor(Math.random() * 10)];
  }

  return result;
}

// nén ảnh trước khi upload
async function compressAndUploadImage(file: File) {
  const isCompressibleImage = /image\/(jpeg|jpg|png|webp)/i.test(file.type);
  const shouldCompress = isCompressibleImage && file.size > 450 * 1024;

  const finalFile = shouldCompress
    ? await compressImage(file, {
        maxSizeMB: 10,
        maxWidthOrHeight: 4096,
        initialQuality: 1,
      })
    : file;

  return await uploadImage(finalFile);
}

// 📥 GET POSTS (có pagination)
export const getPosts = async (from?: number, to?: number) => {
  let query = supabase
    .from("posts")
    .select("*")
    // .eq("visibility", "public")
    .order("is_pinned", { ascending: false }) // 🔥 pin lên đầu
    .order("created_at", { ascending: false });

  if (from !== undefined && to !== undefined) {
    query = query.range(from, to);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error("Lỗi getPosts:", error);
    return [];
  }

  if (!posts || posts.length === 0) return [];

  const userIds = [...new Set(posts.map((p) => p.user_id).filter(Boolean))];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, avatar")
    .in("id", userIds);

  if (profileError) {
    console.error("Lỗi getProfiles:", profileError);
  }

  const postsWithProfiles = posts.map((post) => {
    const profile = profiles?.find((p) => p.id === post.user_id);

    return {
      ...post,
      profiles: profile || null,
    };
  });

  return postsWithProfiles;
};

// ✍️ CREATE POST
export const createPost = async ({
  content,
  files,
  user_id,
  visibility = "public",
}: {
  content: string;
  files: File[];
  user_id: string;
  visibility?: "public" | "privacy";
}) => {
  let uploadedImages: UploadedImage[] = [];

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn chưa đăng nhập",
      };
    }

    // 🔒 chỉ cho chính user đang đăng nhập tạo bài của họ
    if (user.id !== user_id) {
      return {
        success: false,
        error: "Không hợp lệ",
      };
    }

    if (files.length > 0) {
      const settledUploads = await Promise.allSettled(
        files.map((file) => compressAndUploadImage(file))
      );

      let hasUploadFailure = false;

      for (const result of settledUploads) {
        if (result.status === "rejected") {
          console.error("Upload lỗi:", result.reason);
          hasUploadFailure = true;
          continue;
        }

        const url = result.value?.url;
        const publicId = result.value?.public_id;

        if (!url || !publicId) {
          console.error("Upload trả về dữ liệu không đầy đủ:", result.value);
          hasUploadFailure = true;
          continue;
        }

        uploadedImages.push({
          url,
          public_id: publicId,
        });
      }

      if (hasUploadFailure) {
        await rollbackUploadedImages(
          uploadedImages.map((image) => image.public_id),
          "Create post upload failure"
        );

        return {
          success: false,
          error: "Upload ảnh thất bại",
        };
      }
    }

    const imageUrls = uploadedImages.map((img) => img.url);
    const publicIds = uploadedImages.map((img) => img.public_id);

    const hashtags = content.match(/#[\wÀ-ỹ]+/g) || [];
    const id = generateNumericId();

    const { error: insertError } = await supabase.from("posts").insert([
      {
        id,
        content,
        images: imageUrls,
        public_ids: publicIds,
        hashtags,
        user_id: user.id,
        visibility,
        cover_image: imageUrls[0] || null,
      },
    ]);

    if (insertError) {
      console.error("Lỗi insert:", insertError);

      await rollbackUploadedImages(
        publicIds,
        "Create post database insert failure"
      );

      return {
        success: false,
        error: insertError.message,
      };
    }

    return {
      success: true,
      id,
    };
  } catch (error: unknown) {
    console.error("Lỗi hệ thống:", error);

    await rollbackUploadedImages(
      uploadedImages.map((image) => image.public_id),
      "Create post unexpected failure"
    );

    return {
      success: false,
      error: "Lỗi hệ thống",
    };
  }
};

// 🗑️ DELETE POST
export const deletePost = async (
  postId: string,
  _legacyPublicIds?: string[]
) => {
  // Giữ tham số thứ hai để các caller cũ không bị vỡ signature.
  // Public IDs dùng để cleanup luôn được lấy trực tiếp từ database.
  void _legacyPublicIds;

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn chưa đăng nhập",
      };
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("user_id, public_ids")
      .eq("id", postId)
      .maybeSingle();

    if (postError) {
      console.error("Lỗi lấy bài viết trước khi xóa:", postError);
      return {
        success: false,
        error: postError.message,
      };
    }

    if (!post) {
      return {
        success: false,
        error: "Không tìm thấy bài viết",
      };
    }

    if (post.user_id !== user.id) {
      return {
        success: false,
        error: "Không có quyền xóa bài viết",
      };
    }

    const publicIdsFromDatabase = normalizePublicIds(post.public_ids);

    /**
     * Xóa database trước.
     *
     * Cloudinary và Supabase không có transaction chung. Nếu xóa Cloudinary
     * trước rồi Supabase thất bại, bài viết còn tồn tại nhưng ảnh đã mất.
     * Vì vậy database là source of truth; cleanup Cloudinary chạy sau.
     */
    const {
      data: deletedPost,
      error: deleteError,
    } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (deleteError) {
      console.error("Lỗi delete post:", deleteError);
      return {
        success: false,
        error: deleteError.message,
      };
    }

    if (!deletedPost) {
      return {
        success: false,
        error: "Không thể xóa bài viết",
      };
    }

    // Bài không có ảnh: hoàn tất ngay, không gọi Cloudinary.
    if (publicIdsFromDatabase.length === 0) {
      return {
        success: true,
      };
    }

    // Cleanup ảnh là best-effort sau khi database đã xóa thành công.
    const cleanup = await deleteImagesViaApi(publicIdsFromDatabase);

    if (!cleanup.success) {
      console.error("Bài viết đã xóa nhưng cleanup Cloudinary chưa hoàn tất:", {
        failedPublicIds: cleanup.failedPublicIds,
      });

      return {
        success: true,
        warning: `Bài viết đã được xóa nhưng ${cleanup.failedPublicIds.length} hình ảnh chưa được dọn khỏi Cloudinary.`,
      };
    }

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Lỗi hệ thống khi xóa bài viết:", error);
    return {
      success: false,
      error: "Lỗi hệ thống",
    };
  }
};

// 📌 PIN / UNPIN POST
export const pinPost = async (postId: string, currentPinned: boolean) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Chưa đăng nhập" };
  }
  try {
    // 👉 Nếu đang GHIM -> bấm lần nữa là BỎ GHIM
    if (currentPinned) {
      const { error } = await supabase
        .from("posts")
        .update({ is_pinned: false })
        .eq("id", postId);

      if (error) {
        console.error("Lỗi unpin post:", error);
        return { success: false, error: error.message };
      }

      return {
        success: true,
        mode: "unpin",
      };
    }

    // 👉 Nếu đang CHƯA GHIM -> phải đảm bảo chỉ còn 1 bài pinned duy nhất

    // 1) Bỏ ghim tất cả bài đang ghim
    const { error: unpinAllError } = await supabase
      .from("posts")
      .update({ is_pinned: false })
      .eq("is_pinned", true);

    if (unpinAllError) {
      console.error("Lỗi unpin all posts:", unpinAllError);
      return { success: false, error: unpinAllError.message };
    }

    // 2) Ghim bài target
    const { error: pinError } = await supabase
      .from("posts")
      .update({ is_pinned: true })
      .eq("id", postId);

    if (pinError) {
      console.error("Lỗi pin target post:", pinError);
      return { success: false, error: pinError.message };
    }

    return {
      success: true,
      mode: "pin",
    };
  } catch (error: unknown) {
    console.error("Lỗi pinPost:", error);
    return {
      success: false,
      error: "Lỗi hệ thống",
    };
  }
};

// ✏️ UPDATE POST (TEXT + IMAGE + REORDER)
export const updatePost = async ({
  postId,
  content,
  removedPublicIds = [],
  orderedImageItems,
}: {
  postId: string;
  content: string;
  removedPublicIds?: string[];
  orderedImageItems?: OrderedImageItem[];
}) => {
  let newUploadedImageIds: string[] = [];

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Bạn chưa đăng nhập",
      };
    }

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id, images, public_ids")
      .eq("id", postId)
      .maybeSingle();

    if (postError) {
      console.error("Lỗi lấy bài viết trước khi cập nhật:", postError);
      return {
        success: false,
        error: postError.message,
      };
    }

    if (!post) {
      return {
        success: false,
        error: "Không tìm thấy bài viết",
      };
    }

    if (post.user_id !== user.id) {
      return {
        success: false,
        error: "Bạn không có quyền sửa bài viết này",
      };
    }

    const currentImages = normalizeStringArray(post.images);
    const currentPublicIds = normalizeStringArray(post.public_ids);
    const currentUniquePublicIds = [...new Set(currentPublicIds)];
    const requestedRemovedIds = normalizePublicIds(removedPublicIds);

    const unknownRequestedRemovedIds = requestedRemovedIds.filter(
      (publicId) => !currentUniquePublicIds.includes(publicId)
    );

    if (unknownRequestedRemovedIds.length > 0) {
      console.warn(
        "Một số removedPublicIds không còn tồn tại trong dữ liệu bài viết hiện tại. Bỏ qua để tránh xóa nhầm asset.",
        unknownRequestedRemovedIds
      );
    }

    let finalImages: string[] = [];
    let finalPublicIds: string[] = [];

    /**
     * Nếu caller không truyền orderedImageItems thì bảo toàn ảnh hiện tại.
     *
     * Trường hợp chỉ truyền removedPublicIds vẫn được hỗ trợ nếu images và
     * public_ids trong DB đang đồng bộ theo cùng index.
     */
    if (orderedImageItems === undefined) {
      if (requestedRemovedIds.length === 0) {
        finalImages = [...currentImages];
        finalPublicIds = [...currentPublicIds];
      } else {
        if (currentImages.length !== currentPublicIds.length) {
          return {
            success: false,
            error:
              "Dữ liệu ảnh của bài viết không đồng bộ, không thể xác định chính xác ảnh cần xóa.",
          };
        }

        for (let index = 0; index < currentPublicIds.length; index++) {
          const publicId = currentPublicIds[index];

          if (requestedRemovedIds.includes(publicId)) {
            continue;
          }

          finalImages.push(currentImages[index]);
          finalPublicIds.push(publicId);
        }
      }
    } else {
      // Validate existing items trước khi upload ảnh mới để tránh tạo orphan asset.
      for (const item of orderedImageItems) {
        if (item.type !== "existing") continue;

        if (!item.url?.trim() || !item.public_id?.trim()) {
          return {
            success: false,
            error: "Dữ liệu ảnh hiện tại không hợp lệ",
          };
        }
      }

      const newItems = orderedImageItems.filter(
        (
          item
        ): item is {
          id: string;
          type: "new";
          url: string;
          file: File;
        } => item.type === "new"
      );

      const uploadMap = new Map<string, UploadedImage>();

      if (newItems.length > 0) {
        const settledUploads = await Promise.allSettled(
          newItems.map(async (item) => ({
            itemId: item.id,
            uploaded: await compressAndUploadImage(item.file),
          }))
        );

        let hasUploadFailure = false;

        for (const result of settledUploads) {
          if (result.status === "rejected") {
            console.error("Upload ảnh mới lỗi:", result.reason);
            hasUploadFailure = true;
            continue;
          }

          const { itemId, uploaded } = result.value;
          const url = uploaded?.url;
          const publicId = uploaded?.public_id;

          if (!url || !publicId) {
            console.error("Upload ảnh mới trả về dữ liệu không đầy đủ:", uploaded);
            hasUploadFailure = true;
            continue;
          }

          uploadMap.set(itemId, {
            url,
            public_id: publicId,
          });

          newUploadedImageIds.push(publicId);
        }

        if (hasUploadFailure) {
          await rollbackUploadedImages(
            newUploadedImageIds,
            "Update post upload failure"
          );

          return {
            success: false,
            error: "Upload ảnh mới thất bại",
          };
        }
      }

      // Build lại đúng thứ tự UI.
      for (const item of orderedImageItems) {
        if (item.type === "existing") {
          finalImages.push(item.url.trim());
          finalPublicIds.push(item.public_id.trim());
          continue;
        }

        const uploaded = uploadMap.get(item.id);

        if (!uploaded) {
          await rollbackUploadedImages(
            newUploadedImageIds,
            "Update post missing uploaded item"
          );

          return {
            success: false,
            error: "Không thể xác định ảnh mới đã upload",
          };
        }

        finalImages.push(uploaded.url);
        finalPublicIds.push(uploaded.public_id);
      }
    }

    /**
     * Không tin removedPublicIds từ UI để quyết định asset nào được xóa.
     * Tự so sánh state DB cũ với state cuối cùng để chỉ cleanup những public_id
     * thực sự đã bị loại khỏi bài viết.
     */
    const finalPublicIdSet = new Set(normalizePublicIds(finalPublicIds));
    const publicIdsToDelete = currentUniquePublicIds.filter(
      (publicId) => !finalPublicIdSet.has(publicId)
    );

    const hashtags = content.match(/#[\wÀ-ỹ]+/g) || [];

    /**
     * Update database trước, cleanup Cloudinary sau.
     * Nếu update DB thất bại thì rollback toàn bộ ảnh mới vừa upload.
     */
    const {
      data: updatedPost,
      error: updateError,
    } = await supabase
      .from("posts")
      .update({
        content,
        images: finalImages,
        public_ids: finalPublicIds,
        cover_image: finalImages[0] || null,
        hashtags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (updateError || !updatedPost) {
      console.error("Lỗi update:", updateError);

      await rollbackUploadedImages(
        newUploadedImageIds,
        "Update post database failure"
      );

      return {
        success: false,
        error: updateError?.message || "Không thể cập nhật bài viết",
      };
    }

    // Sau khi DB đã đúng mới dọn các ảnh cũ không còn được bài viết tham chiếu.
    if (publicIdsToDelete.length > 0) {
      const cleanup = await deleteImagesViaApi(publicIdsToDelete);

      if (!cleanup.success) {
        console.error("Cập nhật bài viết thành công nhưng cleanup ảnh cũ chưa hoàn tất:", {
          failedPublicIds: cleanup.failedPublicIds,
        });

        return {
          success: true,
          warning: `Bài viết đã được cập nhật nhưng ${cleanup.failedPublicIds.length} hình ảnh cũ chưa được dọn khỏi Cloudinary.`,
        };
      }
    }

    return {
      success: true,
    };
  } catch (error: unknown) {
    console.error("Lỗi update post:", error);

    await rollbackUploadedImages(
      newUploadedImageIds,
      "Update post unexpected failure"
    );

    return {
      success: false,
      error: "Lỗi cập nhật bài viết",
    };
  }
};

export async function getPostsByHashtag(tag: string, from = 0, to = 2) {
  // ✅ DB của bạn đang lưu hashtag có cả dấu #
  const normalizedTag = tag.trim().startsWith("#")
    ? tag.trim().toLowerCase()
    : `#${tag.trim().toLowerCase()}`;

  let query = supabase
    .from("posts")
    .select("*")
    // .eq("visibility", "public")
    .contains("hashtags", [normalizedTag])
    .order("is_pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (from !== undefined && to !== undefined) {
    query = query.range(from, to);
  }

  const { data: posts, error } = await query;

  if (error) {
    console.error("❌ getPostsByHashtag error:", error.message);
    return [];
  }

  if (!posts || posts.length === 0) return [];

  // ✅ GIỮ NGUYÊN LOGIC BACKEND CŨ như getPosts()
  const userIds = [...new Set(posts.map((p) => p.user_id).filter(Boolean))];

  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("id, name, avatar")
    .in("id", userIds);

  if (profileError) {
    console.error("❌ getPostsByHashtag profiles error:", profileError.message);
  }

  const postsWithProfiles = posts.map((post) => {
    const profile = profiles?.find((p) => p.id === post.user_id);

    return {
      ...post,
      profiles: profile || null,
    };
  });

  return postsWithProfiles;
}

export async function countPostsByHashtag(tag: string) {
  // ✅ DB đang lưu hashtag có dấu #
  const normalizedTag = tag.trim().startsWith("#")
    ? tag.trim().toLowerCase()
    : `#${tag.trim().toLowerCase()}`;

  const { count, error } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    // .eq("visibility", "public")
    .contains("hashtags", [normalizedTag]);

  if (error) {
    console.error("❌ countPostsByHashtag error:", error.message);
    return 0;
  }

  return count || 0;
}

export const getPostById = async (postId: string) => {
  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", postId)
    .single();

  if (error || !post) {
    console.error("Lỗi getPostById:", error);
    return null;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, avatar")
    .eq("id", post.user_id)
    .single();

  return {
    ...post,
    profiles: profile || null,
  };
};

// tính năng chỉnh sửa ngày đăng bài và quyền xem bài viết (công khai / riêng tư)
export async function updatePostDate(postId: string, newDate: string) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (!user || !post || post.user_id !== user.id) {
    throw new Error("Không có quyền");
  }
  const { data, error } = await supabase
    .from("posts")
    .update({
      created_at: newDate,
    })
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePostVisibility(
  postId: string,
  visibility: "public" | "privacy"
) {
  // 🔒 CHECK USER
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post, error: postError } = await supabase
    .from("posts")
    .select("user_id")
    .eq("id", postId)
    .single();

  if (postError || !user || !post || post.user_id !== user.id) {
    throw new Error("Không có quyền");
  }

  // 🔥 UPDATE
  const { data, error } = await supabase
    .from("posts")
    .update({
      visibility,
    })
    .eq("id", postId)
    .select()
    .single();

  if (error) throw error;

  return data;
}