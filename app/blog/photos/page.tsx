import type { Metadata } from "next";
import PhotoSection from "@/components/blog/photos/PhotoSection";

export const metadata: Metadata = {
  title: "Ảnh trên Blog",
  description: "Thư viện ảnh từ những bài viết trên Blog của Vũ Trường.",
  alternates: {
    canonical: "/blog/photos",
  },
};

export default function BlogPhotosPage() {
  return <PhotoSection />;
}
