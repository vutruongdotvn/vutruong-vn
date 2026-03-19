import "./globals.css";
import { Roboto } from "next/font/google";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://vutruong.vn"),

  title: {
    default: "Trang chủ | VT System",
    template: "%s | VT System",
  },

  description: "Hệ sinh thái số của Vũ Trường | VT System - vutruong.vn",

  openGraph: {
    title: "VT System",
    description: "Hệ sinh thái số cá nhân",
    url: "https://vutruong.vn",
    siteName: "VT System",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "vi_VN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "VT System",
    description: "Hệ sinh thái số cá nhân",
    images: ["/og.png"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};