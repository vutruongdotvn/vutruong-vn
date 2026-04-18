import { Metadata } from "next";
import SecretGuard from "@/components/secret/SecretGuard";

// 🚀 Khai báo Metadata chuẩn của Next.js (Hoạt động hoàn hảo khi reload)
export const metadata: Metadata = {
  title: "Secret",
  description: "Hệ thống quản lý và lưu trữ tài khoản cá nhân mã hóa an toàn.",
  robots: "noindex, nofollow", // Cấm Bot Google index
};

export default function SecretLayout({ children }: { children: React.ReactNode }) {
  return <SecretGuard>{children}</SecretGuard>;
}