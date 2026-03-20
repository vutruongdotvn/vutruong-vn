import type { Metadata } from "next";

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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">

      {/* Glow background giống bio */}
      <div className="absolute w-[600px] h-[600px] bg-blue-200/30 blur-3xl rounded-full top-[-200px] left-[-200px]" />
      <div className="absolute w-[500px] h-[500px] bg-purple-200/30 blur-3xl rounded-full bottom-[-200px] right-[-200px]" />

      <div className="relative w-full max-w-xl px-6">
        {children}
      </div>
    </section>
  );
}