import type { Metadata } from "next";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Giới thiệu",
  description: "Khám phá câu chuyện, kỹ năng, các dự án cá nhân và kết nối với Vũ Trường.",
  openGraph: {
    title: "Giới thiệu",
    description: "Khám phá câu chuyện, kỹ năng, các dự án cá nhân và kết nối với Vũ Trường.",
    url: "https://www.vutruong.vn/about", // Thay bằng domain chuẩn của bạn
    siteName: "VT Zone",
    images: [
      {
        url: "/og.png", // Bạn nhớ chuẩn bị 1 ảnh cover đẹp bỏ vào thư mục public nhé
        width: 1200,
        height: 630,
        alt: "Vũ Trường Portfolio",
      },
    ],
    locale: "vi_VN",
    type: "profile",
  },
  robots: "noindex, nofollow", // Cấm Bot Google index
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* Main Container */}
      <main className="relative py-26" id="about">
        {children}
      </main>
    </div>
  );
}