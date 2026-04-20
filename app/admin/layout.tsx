import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  description: "Khu vực quản trị viên VT Zone.",
  robots: "noindex, nofollow", // Cấm Bot Google index
};

export default function BioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="admin">
      {/* Content */}
        {children}
    </section>
  );
}