import type { Metadata } from "next";
import { Roboto } from 'next/font/google';
import "./globals.css";
import { ThemeProvider } from "next-themes";

// Load Roboto full weights
const roboto = Roboto({
  subsets: ['latin', 'vietnamese'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-roboto',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "VT System",
  description: "VT System | vutruong.vn",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${roboto.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"       // mặc định sáng
          enableSystem               // theo hệ thống
          disableTransitionOnChange  // tránh flash khi chuyển
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}