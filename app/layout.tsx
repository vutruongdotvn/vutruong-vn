import "./globals.css";
import { Suspense } from "react";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import AuthProvider from "@/components/AuthProvider";
import LayoutShell from "@/components/LayoutShell";
import { ToastProvider } from "@/components/ui/ToastProvider";
import ConditionalPageTransition from "@/components/ConditionalPageTransition";
import LiquidMenu from "@/components/LiquidMenu";
import RouteChangeIndicator from "@/components/RouteChangeIndicator";

// Cache trong 1 giờ, hoặc thậm chí 1 ngày (86400)
export const revalidate = 86400;

// 🔤 Font
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-roboto",
  display: "swap",
});

// 🌐 SEO GLOBAL
export const metadata: Metadata = {
  metadataBase: new URL("https://www.vutruong.vn"),

  title: {
    default: "Zone",
    template: "%s",
  },

  description: "Hệ sinh thái số cá nhân của Vũ Trường trên Internet | vutruong.vn",

  keywords: [
    "Vũ Trường",
    "vutruong",
    "vutruong.vn",
    "blog cá nhân",
    "VT Zone",
    "vt zone",
    "vtzone",
    "vt blog",
    "vtblog",
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
    description: "Hệ sinh thái số cá nhân của Vũ Trường trên Internet",
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
    <html lang="vi" id="vt-zone" className={`${roboto.variable}`}>
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-title" content="VT Zone" />
        <link rel="apple-touch-icon" href="/app.jpg" />
        <link href="//kit-pro.fontawesome.com/releases/v7.3.1/css/pro.min.css" rel="stylesheet" />
      </head>

      <body className="antialiased bg-[#f2f3f5]">
        <Suspense fallback={null}>
          <RouteChangeIndicator />
        </Suspense>

        {/* Background ô vuông 
        <div
          className="pointer-events-none fixed -inset-1 -z-1 opacity-[0.5] mix-blend-overlay"
          style={{
            backgroundImage: `
              linear-gradient(to right, #000 1px, transparent 1px),
              linear-gradient(to bottom, #000 1px, transparent 1px)
            `,
            backgroundSize: "45px 45px",
          }}
        />
        */}


        <ToastProvider>
          <AuthProvider>
            <LayoutShell>
              <ConditionalPageTransition>
                {children}
              </ConditionalPageTransition>
            </LayoutShell>
          </AuthProvider>
        </ToastProvider>


        <LiquidMenu />

      </body>
    </html>
  );
}
