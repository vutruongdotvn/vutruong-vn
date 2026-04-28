import type { Metadata } from "next";
export const revalidate = 3600; // cache 1h

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
// Trang VT Hi không cần SEO