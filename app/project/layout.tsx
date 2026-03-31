import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dự án",
  description: "Các dự án mình đã thực hiện",
};

export default function ProjectLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden py-30">
      
      {/* Content */}
      <div className="relative w-full max-w-2xl md:px-0 px-4">
        {children}
      </div>
    </section>
  );
}