import { MenuItem } from "./types";

export const mainMenu: MenuItem[] = [
  { name: "Home", href: "/", icon: "fa-duotone fa-house" },
  { name: "About", href: "/about", icon: "fa-duotone fa-user" },
  { name: "Contact", href: "/contact", icon: "fa-duotone fa-envelope" },
  { name: "Blog", href: "/blog", icon: "fa-duotone fa-comment-pen" },
];

export const moreMenu: MenuItem[] = [
  { name: "Watch", href: "/watch", icon: "fa-duotone fa-clapperboard-play" },
  { name: "Secret", href: "/secret", icon: "fa-duotone fa-shield-keyhole" },
  { name: "Admin", href: "/admin", icon: "fa-duotone fa-user-gear" },
];

export const mobileMenu: MenuItem[] = [...mainMenu, ...moreMenu];

export const pageMeta = {
  "/": { title: "Trang chủ", subtitle: "VT Zone" },
  "/about": { title: "Giới thiệu", subtitle: "Giới thiệu" },
  "/contact": { title: "Liên hệ", subtitle: "Liên hệ" },
  "/blog": { title: "Blog", subtitle: "Blog cá nhân" },
  "/watch": { title: "Watch", subtitle: "Thư giãn" },
  "/secret": { title: "Secret", subtitle: "ID & Password" },
  "/profile": { title: "Profile", subtitle: "Profile" },
  "/admin": { title: "Admin", subtitle: "Admin Panel" },
} as const;