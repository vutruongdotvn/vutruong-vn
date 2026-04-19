"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  { label: "Bài viết", icon: "fa-feed", href: "/blog" },
  { label: "Giới thiệu", icon: "fa-user", href: "/blog/about" },
  { label: "Ảnh", icon: "fa-image", href: "/blog/photos" },
  { label: "Video", icon: "fa-video", href: "/blog/videos" },
  { label: "Films", icon: "fa-film", href: "/blog/films" },
  { label: "Thư viện", icon: "fa-photo-film", href: "/blog/library" },
  { label: "Feed", icon: "fa-rss", href: "/blog/feed" },
];

export default function BlogNavbar() {
  const pathname = usePathname();

  return (
    <div
      className="absolute bottom-0 left-0 m-3
        rounded-0 sm:rounded-lg
        bg-white/10 hover:bg-white/15 backdrop-blur-lg
        shadow-[0_8px_30px_rgba(0,0,0,0.04)]
        transition-all duration-300
        hover:shadow-[0_12px_40px_rgba(0,0,0,0.075)]
      "
    >
      <div className="px-4 sm:px-6">
        <div className="flex gap-6 text-sm font-medium overflow-x-auto scrollbar-none">

          {tabs.map((tab) => {
            const isActive =
              pathname === tab.href ||
              (tab.href !== "/blog" && pathname.startsWith(tab.href));

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`text-white/70 hover:text-white active:scale-95 font-normal
                  flex items-center gap-2 py-3 border-b-2 transition
                  ${
                    isActive
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }
                `}
              >
                <i className={`fa-duotone ${tab.icon}`} />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}