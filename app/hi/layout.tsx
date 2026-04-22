import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hi",
  description: "Trang chào mừng trên trình duyệt Web.",
  robots: "noindex, nofollow", // Cấm Bot Google index
};

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
// Trang VT Welcome không cần SEO