import "./globals.css";
import { Roboto } from "next/font/google";
import type { Metadata } from "next";


export const metadata = {
  title: {
    default: "Trang chủ | VT System",
    template: "%s | VT System",
  },
  description: "Hệ sinh thái số của Vũ Trường | VT System - vutruong.vn",
};

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <link
          rel="stylesheet"
          href="//kit-pro.fontawesome.com/releases/v7.2.0/css/pro.min.css"
          />
      </head>
      <body className={roboto.className}>{children}</body>
    </html>
  );
}