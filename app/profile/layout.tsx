import type { Metadata } from "next";
// Cache trong 1 giờ, hoặc thậm chí 1 ngày (86400)
export const revalidate = 86400;

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