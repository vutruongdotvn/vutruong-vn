import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Liên kết mạng xã hội",
  description: "Kết nối với Vũ Trường qua mạng xã hội",
};

export default function BioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="relative min-h-screen flex items-start justify-center overflow-hidden py-28">

      {/* Content */}
      <div className="relative w-full max-w-2xl md:px-0 px-4">
        {children}
      </div>
    </section>
  );
}