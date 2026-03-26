import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/cloudinary";

function normalizePublicIds(value: any): string[] {
  if (Array.isArray(value)) return value.filter(Boolean);

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return value ? [value] : [];
    }
  }

  return [];
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

// 📥 GET POSTS (có pagination)
export const getPosts = async (from?: number, to?: number) => {
  let query = supabase
    .from("posts")
    .select("*")
    .eq("visibility", "public")
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
  visibility?: "public" | "draft" | "private";
}) => {
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

    const uploadPromises = files.map(async (file) => {
      try {
        const result = await uploadImage(file);

        return {
          url: result.url, // giữ nguyên ảnh gốc
          public_id: result.public_id,
        };
      } catch (err) {
        console.error("Upload lỗi:", err);
        throw err;
      }
    });

    let uploadedImages;

    try {
      uploadedImages = await Promise.all(uploadPromises);
    } catch (err) {
      return {
        success: false,
        error: "Upload ảnh thất bại",
      };
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
        cover_image: imageUrls?.[0] || null,
      },
    ]);

    if (insertError) {
      console.error("Lỗi insert:", insertError);
      return {
        success: false,
        error: insertError.message,
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Lỗi hệ thống:", err);
    return {
      success: false,
      error: "Lỗi hệ thống",
    };
  }
};

// 🗑️ DELETE POST
export const deletePost = async (postId: string, public_ids: string[]) => {
  try {
    console.log("🔥 DELETE SERVICE - public_ids:", public_ids);

    // 🔥 XÓA ẢNH CLOUDINARY TRƯỚC
    if (public_ids && public_ids.length > 0) {
      try {
        const res = await fetch(`${window.location.origin}/api/delete-images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_ids }),
        });

        const data = await res.json();

        console.log("🔥 DELETE API RESPONSE:", data);

        if (!data.success) {
          return { success: false, error: "Xóa ảnh thất bại" };
        }
      } catch (err) {
        console.error("❌ FETCH DELETE ERROR:", err);
        return { success: false, error: "Không thể gọi API xóa ảnh" };
      }
    }

    // 🔥 SAU ĐÓ MỚI XÓA DB
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Lỗi xoá" };
  }
};

// 📌 PIN / UNPIN
export const pinPost = async (postId: string, isPinned: boolean) => {
  try {
    // 👉 nếu đang ghim → bỏ ghim
    if (isPinned) {
      const { error } = await supabase
        .from("posts")
        .update({ is_pinned: false })
        .eq("id", postId);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    }

    // 👉 nếu chưa ghim → reset rồi ghim
    await supabase.from("posts").update({ is_pinned: false }).neq("id", "");

    const { error } = await supabase
      .from("posts")
      .update({ is_pinned: true })
      .eq("id", postId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: "Lỗi ghim bài" };
  }
};

// ✏️ UPDATE POST (TEXT ONLY)
// ✏️ UPDATE POST (TEXT + IMAGES)
export const updatePost = async ({
  postId,
  content,
  existingImages,
  existingPublicIds,
  removedPublicIds,
  newFiles,
}: {
  postId: string;
  content: string;
  existingImages: string[];
  existingPublicIds: string[];
  removedPublicIds: string[];
  newFiles: File[];
}) => {
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

    // 🔒 kiểm tra quyền
    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id")
      .eq("id", postId)
      .single();

    if (postError || !post) {
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

    // 1) Upload ảnh mới (nếu có)
    let uploadedImages: { url: string; public_id: string }[] = [];

    if (newFiles.length > 0) {
      try {
        uploadedImages = await Promise.all(
          newFiles.map(async (file) => {
            const result = await uploadImage(file);
            return {
              url: result.url,
              public_id: result.public_id,
            };
          })
        );
      } catch (err) {
        console.error("Upload ảnh mới lỗi:", err);
        return {
          success: false,
          error: "Upload ảnh mới thất bại",
        };
      }
    }

    // 2) Xóa ảnh cũ trên Cloudinary (nếu có)
    const normalizedRemovedPublicIds = normalizePublicIds(removedPublicIds);

if (normalizedRemovedPublicIds.length > 0) {
  try {
    console.log("🗑️ removedPublicIds:", normalizedRemovedPublicIds);

    const res = await fetch(`${window.location.origin}/api/delete-images`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_ids: normalizedRemovedPublicIds }),
    });

    const data = await res.json();

    console.log("🗑️ delete-images response:", data);

    if (!data.success) {
      return {
        success: false,
        error: "Xóa ảnh cũ thất bại",
      };
    }
  } catch (err) {
    console.error("❌ Xóa ảnh cũ lỗi:", err);
    return {
      success: false,
      error: "Không thể xóa ảnh cũ",
    };
  }
}

    // 3) Gộp ảnh cuối cùng
    const finalImages = [
      ...existingImages,
      ...uploadedImages.map((img) => img.url),
    ];

    const finalPublicIds = [
      ...existingPublicIds,
      ...uploadedImages.map((img) => img.public_id),
    ];

    const hashtags = content.match(/#[\wÀ-ỹ]+/g) || [];

    // 4) Update DB
    const { error: updateError } = await supabase
      .from("posts")
      .update({
        content,
        images: finalImages,
        public_ids: finalPublicIds,
        hashtags,
        cover_image: finalImages?.[0] || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (updateError) {
      return {
        success: false,
        error: updateError.message,
      };
    }

    return { success: true };
  } catch (err) {
    console.error("Lỗi update post:", err);
    return {
      success: false,
      error: "Lỗi cập nhật bài viết",
    };
  }
};