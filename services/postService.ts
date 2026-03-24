import { supabase } from "@/lib/supabase";
import { uploadImage } from "@/lib/cloudinary";
import { compressImage } from "@/lib/compressImage";

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

  const userIds = posts.map((p) => p.user_id).filter(Boolean);

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, avatar")
    .in("id", userIds);

  const postsWithProfiles = posts.map((post) => {
    const profile = profiles?.find((p) => p.id === post.user_id);

    return {
      ...post,
      profiles: profile || null,
    };
  });

  return postsWithProfiles;
};

// ✍️ CREATE POST (GIỮ NGUYÊN)
export const createPost = async ({
  content,
  files,
  user_id,
}: {
  content: string;
  files: File[];
  user_id: string;
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

    const uploadPromises = files.map(async (file) => {
      try {
        const compressed = await compressImage(file);
        const result = await uploadImage (compressed);

        const screenWidth =
          typeof window !== "undefined" ? window.innerWidth : 1200;

        const optimizedUrl = result.url.replace(
          "/upload/",
          `/upload/w_${screenWidth},q_auto/`
        );

        return {
          url: optimizedUrl,
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

// 🗑️ DELETE POST (🔥 FIX CHUẨN)
export const deletePost = async (postId: string) => {
  try {
    // 1. lấy public_ids
    const { data: post, error: fetchError } = await supabase
      .from("posts")
      .select("public_ids")
      .eq("id", postId)
      .single();

    if (fetchError || !post) {
      return {
        success: false,
        error: "Không tìm thấy bài viết",
      };
    }

    // 2. xoá Cloudinary (🔥 FIX header)
    if (Array.isArray(post.public_ids) && post.public_ids.length > 0) {
      const res = await fetch("/api/delete-images", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    public_ids: post.public_ids,
  }),
});

const data = await res.json();

console.log("🔥 DELETE CLOUDINARY RESPONSE:", data);
    }

    // 3. xoá DB
    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postId);

    if (deleteError) {
      return {
        success: false,
        error: deleteError.message,
      };
    }

    return { success: true };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Lỗi xoá bài viết",
    };
  }
};

// 📌 PIN / UNPIN (🔥 FIX TOGGLE)
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
    await supabase
      .from("posts")
      .update({ is_pinned: false })
      .neq("id", "");

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