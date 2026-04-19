import FancyboxWrapper from "@/components/blog/FancyboxWrapper";
import BlogPostFeed from "@/components/blog/BlogPostFeed";

// Cache bài viết trong 1 giờ, hoặc thậm chí 1 ngày (86400)
export const revalidate = 3600;

export default function BlogPage() {
  return (
    <>
      <FancyboxWrapper />
      <BlogPostFeed />
    </>
  );
}