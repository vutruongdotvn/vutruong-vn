import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Chỉnh sửa thông tin cá nhân người dùng",
};

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}