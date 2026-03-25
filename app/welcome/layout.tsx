import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Welcome",
  description: "Trang khởi động trên trình duyệt | VT Welcome",
};

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}