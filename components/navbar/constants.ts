import { MenuItem } from "./types";

export const mainMenu: MenuItem[] = [
  { name: "Home", href: "/", icon: "fa-duotone fa-house" },
  { name: "Blog", href: "/blog", icon: "fa-duotone fa-pen" },
];

export const moreMenu: MenuItem[] = [
  { name: "Secret", href: "/secret", icon: "fa-duotone fa-shield-keyhole" },
  { name: "Admin", href: "/admin", icon: "fa-duotone fa-user-gear" },
];

export const mobileMenu: MenuItem[] = [...mainMenu, ...moreMenu];

export const pageMeta = {
  "/": { title: "Zone", subtitle: "VT Zone" },
  "/blog": { title: "Blog", subtitle: "Blog cá nhân" },
  "/secret": { title: "Secret", subtitle: "ID & Password" },
  "/profile": { title: "Profile", subtitle: "Profile" },
  "/admin": { title: "Admin", subtitle: "Admin Panel" },
} as const;