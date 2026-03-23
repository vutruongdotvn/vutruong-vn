import { supabase } from "@/lib/supabase";

function generateNumericId(length = 20) {
  let result = "";
  const digits = "0123456789";

  for (let i = 0; i < length; i++) {
    result += digits[Math.floor(Math.random() * 10)];
  }

  return result;
}

// 🔥 THÊM from, to
export const getPosts = async (from?: number, to?: number) => {
  let query = supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (from !== undefined && to !== undefined) {
    query = query.range(from, to); // 🔥 pagination
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

    const hashtags = content.match(/#[\wÀ-ỹ]+/g) || [];

    const id = generateNumericId();

    const { error: insertError } = await supabase.from("posts").insert([
      {
        id,
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

    return { success: true };
  } catch (err: any) {
    console.error("Lỗi hệ thống:", err);
    return {
      success: false,
      error: "Lỗi hệ thống",
    };
  }
};