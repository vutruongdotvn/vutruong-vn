import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { cn } from "@/lib/utils";
import { Roboto } from "next/font/google";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

// 🔤 Font
const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

// 🌐 SEO GLOBAL
export const metadata: Metadata = {
  metadataBase: new URL("https://vutruong.vn"),

  title: {
    default: "VT Zone | Trang chủ",
    template: "%s | VT Zone",
  },

  description: "Hệ sinh thái số của Vũ Trường trên Internet | vutruong.vn",

  keywords: [
    "Vũ Trường",
    "vutruong",
    "vutruong.vn",
    "blog cá nhân",
    "VT Zone",
    "vt zone",
    "vt blog",
  ],

  authors: [
    {
      name: "Vũ Trường",
      url: "https://vutruong.vn",
    },
  ],

  // 🔥 PWA / APP INFO
  applicationName: "VT Zone",

  icons: {
    icon: "/app.jpg",
    apple: "/app.jpg",
  },

  appleWebApp: {
    capable: true,
    title: "VT Zone",
    statusBarStyle: "black-translucent",
  },

  openGraph: {
    title: "VT Zone",
    description: "Hệ sinh thái số của Vũ Trường",
    url: "https://vutruong.vn",
    siteName: "VT Zone",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "VT Zone",
      },
    ],
    locale: "vi_VN",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "VT Zone",
    description: "Hệ sinh thái số cá nhân",
    images: ["/og.png"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

// 🧱 Layout
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
  <head>
    <link rel="manifest" href="/manifest.json" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="VT Zone" />
    <link rel="apple-touch-icon" href="/app.jpg" />
    <link rel="stylesheet" href="//kit-pro.fontawesome.com/releases/v7.2.0/css/pro.min.css" />
  </head>

  <body className={roboto.className}>
    <Navbar />

    <div className="relative min-h-screen bg-[#f2f3f5] overflow-hidden">
      <PageTransition>
        {children}
      </PageTransition>
    </div>
  </body>
</html>
  );
}