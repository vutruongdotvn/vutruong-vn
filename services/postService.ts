import { supabase } from "@/lib/supabase";

export const getPosts = async () => {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Lỗi getPosts:", error);
    return [];
  }

  // 🔥 LẤY TẤT CẢ USER_ID
  const userIds = posts.map((p) => p.user_id).filter(Boolean);

  // 🔥 FETCH PROFILES
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, name, avatar")
    .in("id", userIds);

  // 🔥 MAP profiles vào posts
  const postsWithProfiles = posts.map((post) => {
    const profile = profiles?.find((p) => p.id === post.user_id);

    return {
      ...post,
      profiles: profile || null,
    };
  });

  return postsWithProfiles;
};

// ✍️ CREATE POST (CHUẨN 100%)
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
    // 🔐 1. LẤY USER THẬT
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

    // 📸 2. UPLOAD ẢNH
    const imageUrls: string[] = [];

    for (const file of files) {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("posts")
        .upload(fileName, file);

      if (uploadError) {
        console.error("Lỗi upload:", uploadError);

        return {
          success: false,
          error: "Upload ảnh thất bại",
        };
      }

      const { data: publicUrlData } = supabase.storage
        .from("posts")
        .getPublicUrl(fileName);

      imageUrls.push(publicUrlData.publicUrl);
    }

    // 🏷️ 3. AUTO HASHTAG (optional)
    const hashtags = content.match(/#[\wÀ-ỹ]+/g) || [];

    // 🧾 4. INSERT DB
    const { error: insertError } = await supabase.from("posts").insert([
  {
    content,
    images: imageUrls,
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

    // ✅ SUCCESS
    return {
      success: true,
    };
  } catch (err: any) {
    console.error("Lỗi hệ thống:", err);

    return {
      success: false,
      error: "Lỗi hệ thống",
    };
  }
};