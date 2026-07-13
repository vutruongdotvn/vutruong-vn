import type { Metadata } from "next";
// Cache trong 1 giờ, hoặc thậm chí 1 ngày (86400)
export const revalidate = 86400;

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
    <section id="contact" className="py-26">
      {children}
    </section>
  );
}