import type { Metadata } from "next";
export const revalidate = 86400; // cache 1d

export const metadata: Metadata = {
  title: "Xin chào!",
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
// Trang VT Hi không cần SEO