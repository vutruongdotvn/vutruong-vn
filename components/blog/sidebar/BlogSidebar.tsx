import IntroWidget from "@/components/blog/sidebar/widget/IntroWidget";
import FeaturedWidget from "@/components/blog/sidebar/widget/FeaturedWidget";
import PhotoWidget from "@/components/blog/sidebar/widget/PhotoWidget";

export default function BlogSidebar() {
  return (
    <aside id="sidebar" className="space-y-1 sm:space-y-4 pb-4">
      <IntroWidget />
      <FeaturedWidget />
      <PhotoWidget />
    </aside>
  );
}
