import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bio",
  description: "Kết nối với Vũ Trường qua mạng xã hội",
};

export default function BioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Glow background */}
      <div className="absolute w-[600px] h-[600px] bg-blue-200/30 blur-3xl rounded-full top-[-200px] left-[-200px]" />
      <div className="absolute w-[500px] h-[500px] bg-purple-200/30 blur-3xl rounded-full bottom-[-200px] right-[-200px]" />

      {/* Content */}
      <div className="relative w-full max-w-xl px-6">
        {children}
      </div>
    </section>
  );
}