import type { ReactNode } from "react";
import type { Metadata } from "next";
import { getPostMetadata } from "@/lib/getPostMetadata";

type BlogPostLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

// Metadata phải phản ánh visibility mới nhất, đặc biệt khi bài viết vừa được
// chuyển từ public sang privacy.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function generateMetadata({
  params,
}: BlogPostLayoutProps): Promise<Metadata> {
  const { id } = await params;
  return getPostMetadata(id);
}

export default function BlogPostLayout({
  children,
}: BlogPostLayoutProps) {
  return <>{children}</>;
}
