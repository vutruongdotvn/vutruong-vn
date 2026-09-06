import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "CV • Vũ Trường",
  },
  description: "Hồ sơ năng lực và kinh nghiệm của Vũ Trường.",
  robots: "noindex, nofollow, noarchive, nosnippet, noimageindex",
};

export default function CvLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
