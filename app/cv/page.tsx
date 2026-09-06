import "server-only";

import { createClient } from "@supabase/supabase-js";
import { connection } from "next/server";
import CvPage from "@/components/cv/CvPage";
import { normalizeCvData } from "@/lib/cv";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const CV_SELECT = [
  "id",
  "full_name",
  "nickname",
  "headline",
  "summary",
  "location",
  "email",
  "website",
  "avatar_url",
  "experience",
  "education",
  "skills",
  "interests",
  "is_published",
  "updated_at",
].join(",");

function createPublicCvClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) return null;

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export default async function Page() {
  await connection();

  const client = createPublicCvClient();
  if (!client) {
    console.error("[cv] Missing public Supabase environment variables.");
    return <CvPage initialCv={null} />;
  }

  const { data, error } = await client
    .from("cv")
    .select(CV_SELECT)
    .eq("id", 1)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    console.error("[cv] Public query failed:", {
      code: error.code,
      message: error.message,
    });
  }

  return <CvPage initialCv={error ? null : normalizeCvData(data)} />;
}
