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

  if (existing) return;

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    name: user.user_metadata?.full_name || "User",
    avatar: user.user_metadata?.avatar_url || "",
  });

  if (insertError) {
    console.error("createProfileIfNotExists insert error:", insertError);
  }
}