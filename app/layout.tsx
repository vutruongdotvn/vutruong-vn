import "./globals.css";
import { Roboto, Geist } from "next/font/google";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});


// 🔤 Font
const roboto = Roboto({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

// 🌐 SEO GLOBAL
export const metadata: Metadata = {
  metadataBase: new URL("https://vutruong.vn"),

  title: {
    default: "VT System",
    template: "%s | VT System",
  },

  description: "Hệ sinh thái số của Vũ Trường trên Internet",

  keywords: [
    "Vũ Trường",
    "vutruong",
    "vutruong.vn",
    "blog cá nhân",
    "vt system",
    "vt zone",
    "vt blog",
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
    <html lang="vi" className={cn("font-sans", geist.variable)}>
      <head>
        {/* FontAwesome */}
        <link
          rel="stylesheet"
          href="//kit-pro.fontawesome.com/releases/v7.2.0/css/pro.min.css"
        />
      </head>
      <body className={`${roboto.className}`}>
        <Navbar />
        <div className="relative min-h-screen bg-gradient-to-br from-gray-200 via-white to-gray-400 overflow-hidden">
          <PageTransition>
            {children}
          </PageTransition>
        </div>
        </body>
    </html>
  );
}