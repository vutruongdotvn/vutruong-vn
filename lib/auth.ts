import { supabase } from "./supabase";

export async function createProfileIfNotExists(user: {
  id: string;
  user_metadata?: {
    full_name?: string;
    avatar_url?: string;
  };
}) {
  if (!user?.id) return;

  const { data: existing, error: existingError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existingError) {
    console.error("createProfileIfNotExists check error:", existingError);
    return;
  }

  if (!existing) {
    // Profile phải được tạo duy nhất bởi trigger handle_new_user đã harden.
    // Client không tự INSERT vì user thường không có quyền tạo profile.
    console.warn("Profile chưa sẵn sàng; chờ Auth trigger đồng bộ.");
  }
}
