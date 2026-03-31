import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import AuthProvider from "@/components/AuthProvider";
import LayoutShell from "@/components/LayoutShell";
import { ToastProvider } from "@/components/ui/ToastProvider";
import PageTransition from "@/components/PageTransition";

// 🔤 Font
const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-roboto",
});

// 🌐 SEO GLOBAL
export const metadata: Metadata = {
  metadataBase: new URL("https://www.vutruong.vn"),

  title: {
    default: "VT Zone",
    template: "%s",
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
      url: "https://www.vutruong.vn",
    },
  ],

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
    url: "https://www.vutruong.vn",
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
    description: "Hệ sinh thái số cá nhân của Vũ Trường",
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
        <link rel="stylesheet" href="//kit-pro.fontawesome.com/releases/v7.2.0/css/pro.min.css"/>
      </head>

      <body className={`${roboto.className} antialiased bg-[#f2f3f5]`}>
        <ToastProvider>
          <LayoutShell>
            <PageTransition>
              <AuthProvider>
                {children}
              </AuthProvider>
            </PageTransition>
          </LayoutShell>
        </ToastProvider>
      </body>
    </html>
  );
}
