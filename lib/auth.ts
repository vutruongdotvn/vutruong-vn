import { supabase } from "./supabase";

export async function createProfileIfNotExists() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;
  if (!user) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (existing) return;

  await supabase.from("profiles").insert({
    id: user.id,
    name: user.user_metadata?.full_name || "User",
    avatar: user.user_metadata?.avatar_url || "",
  });
}