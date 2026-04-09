import { MenuItem } from "./types";

export const mainMenu: MenuItem[] = [
  { name: "Home", href: "/", icon: "fa-duotone fa-house" },
  { name: "Blog", href: "/blog", icon: "fa-duotone fa-comment-pen" },
];

export const moreMenu: MenuItem[] = [
  { name: "Bio", href: "/bio", icon: "fa-duotone fa-users" },
  { name: "Project", href: "/project", icon: "fa-duotone fa-code" },
  { name: "Contact", href: "/contact", icon: "fa-duotone fa-envelope" },
  { name: "Watch", href: "/watch", icon: "fa-duotone fa-clapperboard-play" },
  { name: "Secret", href: "/secret", icon: "fa-duotone fa-lock-keyhole" },
  { name: "Manage", href: "/admin", icon: "fa-duotone fa-user-gear" },
];

export const mobileMenu: MenuItem[] = [...mainMenu, ...moreMenu];

export const pageMeta = {
  "/": { title: "Home", subtitle: "VT Zone" },
  "/bio": { title: "Bio", subtitle: "Kết nối với mình" },
  "/project": { title: "Project", subtitle: "Dự án đã làm" },
  "/contact": { title: "Contact", subtitle: "Liên hệ" },
  "/blog": { title: "Blog", subtitle: "Blog cá nhân" },
  "/watch": { title: "Watch", subtitle: "Thư giãn" },
  "/secret": { title: "Secret", subtitle: "ID & Password" },
  "/profile": { title: "Profile", subtitle: "Profile" },
  "/admin": { title: "Admin", subtitle: "Admin Panel" },
} as const;