import "./globals.css";
import { Roboto } from "next/font/google";
import type { Metadata } from "next";

// 🔤 Font
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "800"],
  display: "swap",
});

// 🌐 SEO GLOBAL
export const metadata: Metadata = {
  metadataBase: new URL("https://vutruong.vn"),

  title: {
    default: "VT System",
    template: "%s | VT System",
  },

  description: "Hệ sinh thái số của Vũ Trường",

  keywords: [
    "Vũ Trường",
    "vutruong",
    "blog cá nhân",
    "hệ sinh thái số",
  ],

  authors: [
    {
      name: "Vũ Trường",
      url: "https://vutruong.vn",
    },
  ],

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
        alt: "VT System",
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

  robots: {
    index: true,
    follow: true,
  },

  icons: {
    icon: "/favicon.ico",
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
        {/* FontAwesome */}
        <link
          rel="stylesheet"
          href="//kit-pro.fontawesome.com/releases/v7.2.0/css/pro.min.css"
        />
      </head>
      <body className={roboto.className}>
        <div className="relative min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-400 overflow-hidden">
          {children}
          </div>
        </body>
    </html>
  );
}