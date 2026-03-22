import { supabase } from "./supabase";

export async function createProfileIfNotExists() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .single();

  if (existing) return;

  await supabase.from("profiles").insert({
    id: user.id,
    name: user.user_metadata?.full_name || "User",
    avatar: user.user_metadata?.avatar_url || "", // ✅ FIX
  });
}