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

return {
  success: true,
  id, // 👈 thêm dòng này để modal fetch lại bài mới tạo
};
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

        console.log("🔥 DELETE API RESULT:", data);

        if (!data.success) {
          return { success: false, error: "Xóa ảnh thất bại" };
        }
      } catch (err) {
        console.error("❌ FETCH DELETE ERROR:", err);
        return { success: false, error: "Không thể gọi API xóa ảnh" };
      }
    }

    // 🔥 XÓA BÀI VIẾT TRONG DB
    const { error } = await supabase.from("posts").delete().eq("id", postId);

    if (error) {
      console.error("Lỗi delete post:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Lỗi hệ thống:", err);
    return { success: false, error: "Lỗi hệ thống" };
  }
};

// 📌 PIN / UNPIN POST
export const pinPost = async (postId: string, currentPinned: boolean) => {
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
  } catch (err: any) {
    console.error("Lỗi pinPost:", err);
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
  orderedImageItems = [],
}: {
  postId: string;
  content: string;
  removedPublicIds?: string[];
  orderedImageItems?: Array<
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
      }
  >;
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

    const { data: post, error: postError } = await supabase
      .from("posts")
      .select("id, user_id, public_ids")
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

    const normalizedRemovedIds = normalizePublicIds(removedPublicIds);

    // 🔥 XÓA ẢNH CŨ KHỎI CLOUDINARY
    if (normalizedRemovedIds.length > 0) {
      try {
        const res = await fetch(`${window.location.origin}/api/delete-images`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ public_ids: normalizedRemovedIds }),
        });

        const data = await res.json();

        console.log("🔥 DELETE RESULT:", data);

        if (!data.success) {
          return { success: false, error: "Xóa ảnh cũ thất bại" };
        }
      } catch (err) {
        console.error("❌ FETCH DELETE ERROR:", err);
        return { success: false, error: "Không thể gọi API xóa ảnh cũ" };
      }
    }

    // 🔥 UPLOAD TẤT CẢ ẢNH MỚI (THEO ID TẠM)
    const uploadMap = new Map<string, { url: string; public_id: string }>();

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

    if (newItems.length > 0) {
      try {
        const uploadedResults = await Promise.all(
          newItems.map(async (item) => {
            const result = await uploadImage(item.file);

            return {
              id: item.id,
              url: result.url,
              public_id: result.public_id,
            };
          })
        );

        uploadedResults.forEach((img) => {
          uploadMap.set(img.id, {
            url: img.url,
            public_id: img.public_id,
          });
        });
      } catch (err) {
        console.error("Upload lỗi:", err);
        return {
          success: false,
          error: "Upload ảnh mới thất bại",
        };
      }
    }

    // 🔥 BUILD LẠI ẢNH THEO ĐÚNG THỨ TỰ UI
    const finalImages: string[] = [];
    const finalPublicIds: string[] = [];

    for (const item of orderedImageItems) {
      if (item.type === "existing") {
        finalImages.push(item.url);
        finalPublicIds.push(item.public_id);
      }

      if (item.type === "new") {
        const uploaded = uploadMap.get(item.id);

        if (uploaded) {
          finalImages.push(uploaded.url);
          finalPublicIds.push(uploaded.public_id);
        }
      }
    }

    const hashtags = content.match(/#[\wÀ-ỹ]+/g) || [];

    const { error: updateError } = await supabase
      .from("posts")
      .update({
        content,
        images: finalImages,
        public_ids: finalPublicIds,
        cover_image: finalImages[0] || null,
        hashtags,
        updated_at: new Date().toISOString(),
      })
      .eq("id", postId);

    if (updateError) {
      console.error("Lỗi update:", updateError);
      return {
        success: false,
        error: updateError.message,
      };
    }

    return { success: true };
  } catch (err: any) {
    console.error("Lỗi update post:", err);
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
    .eq("visibility", "public")
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
    .eq("visibility", "public")
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