import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "VT Watch!",
  description:
    "Dự án phim cá nhân của Vũ Trường. Hiện đang nhúng hệ thống films.vutruong.vn và sẽ được phát triển riêng trong tương lai.",
};

export default function WatchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}