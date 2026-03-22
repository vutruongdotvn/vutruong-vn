import type { Metadata } from "next";
import BackgroundGlow from "@/components/home/BackgroundGlow";

export const metadata: Metadata = {
  title: "Liên hệ",
  description: "Liên hệ | Công việc",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden py-24">
      {/* Glow background */}
      <BackgroundGlow />

      {/* Content */}
      <div className="relative w-full max-w-xl px-6">
        {children}
      </div>
    </section>
  );
}