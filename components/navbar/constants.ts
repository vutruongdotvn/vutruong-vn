import { MenuItem } from "./types";

export const mainMenu: MenuItem[] = [
  { name: "Home", href: "/", icon: "fa-duotone fa-house" },
  { name: "Me", href: "/about", icon: "fa-duotone fa-user-vneck" },
  { name: "Blog", href: "/blog", icon: "fa-duotone fa-pen" },
  { name: "Watch", href: "/watch", icon: "fa-duotone fa-clapperboard-play" },
];

export const moreMenu: MenuItem[] = [
  { name: "Secret", href: "/secret", icon: "fa-duotone fa-shield-keyhole" },
  { name: "Admin", href: "/admin", icon: "fa-duotone fa-user-gear" },
];

export const mobileMenu: MenuItem[] = [...mainMenu, ...moreMenu];

export const pageMeta = {
  "/": { title: "Zone", subtitle: "VT Zone" },
  "/about": { title: "About", subtitle: "Giới thiệu" },
  "/contact": { title: "Contact", subtitle: "Liên hệ" },
  "/blog": { title: "Blog", subtitle: "Blog cá nhân" },
  "/watch": { title: "Watch", subtitle: "Thư giãn" },
  "/secret": { title: "Secret", subtitle: "ID & Password" },
  "/profile": { title: "Profile", subtitle: "Profile" },
  "/admin": { title: "Admin", subtitle: "Admin Panel" },
} as const;