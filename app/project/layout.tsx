import type { Metadata } from "next";
import BackgroundGlow from "@/components/home/BackgroundGlow";

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
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden py-24">
      {/* Glow background */}
      <BackgroundGlow />
      
      {/* Content */}
      <div className="relative w-full max-w-2xl px-6">
        {children}
      </div>
    </section>
  );
}