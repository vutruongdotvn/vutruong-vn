import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    absolute: "VT Welcome",
  },
};

export default function WelcomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
// Trang VT Welcome không cần SEO