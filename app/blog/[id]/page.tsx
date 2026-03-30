import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import BlogDetailRealtime from "@/components/blog/BlogDetailRealtime";

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!id) return notFound();

  const { data: post } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!post) return notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, avatar")
    .eq("id", post.user_id)
    .maybeSingle();

  return <BlogDetailRealtime initialPost={post} initialProfile={profile} />;
}