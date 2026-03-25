import "./globals.css";
import type { Metadata } from "next";
import { Roboto } from "next/font/google";
import "@fancyapps/ui/dist/fancybox/fancybox.css";
import AuthProvider from "@/components/AuthProvider";
import LayoutShell from "@/components/LayoutShell";

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
        <link
          rel="stylesheet"
          href="//kit-pro.fontawesome.com/releases/v7.2.0/css/pro.min.css"
        />
      </head>

      <body className={`${roboto.className} antialiased`}>
        <LayoutShell>
          <div className="relative min-h-screen overflow-hidden bg-[#f6f6f7]">
            {/* ===== Global Ambient Background ===== */}
            <div className="pointer-events-none absolute inset-0">
              {/* Soft atmospheric glows */}
              <div className="absolute -top-32 -left-32 h-[36rem] w-[36rem] rounded-full bg-blue-200/30 blur-3xl" />
              <div className="absolute top-[12%] -right-40 h-[38rem] w-[38rem] rounded-full bg-violet-200/25 blur-3xl" />
              <div className="absolute bottom-[-10rem] left-1/2 h-[30rem] w-[30rem] -translate-x-1/2 rounded-full bg-cyan-100/30 blur-3xl" />

              {/* Light beam top */}
              <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-white/75 via-white/20 to-transparent" />

              {/* Bottom softness */}
              <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-white/30 to-transparent" />

              {/* Soft grid */}
              <div
                className="absolute inset-0 opacity-[0.028]"
                style={{
                  backgroundImage: `
                    linear-gradient(to right, #000 1px, transparent 1px),
                    linear-gradient(to bottom, #000 1px, transparent 1px)
                  `,
                  backgroundSize: "44px 44px",
                }}
              />

              {/* Fine noise texture */}
              <div
                className="absolute inset-0 opacity-[0.022] mix-blend-multiply"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, rgba(0,0,0,0.9) 0.6px, transparent 0.6px)",
                  backgroundSize: "18px 18px",
                }}
              />

              {/* Center soft radial wash */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.5),transparent_55%)]" />
            </div>

            <AuthProvider>
              <div className="relative z-10">{children}</div>
            </AuthProvider>
          </div>
        </LayoutShell>
      </body>
    </html>
  );
}