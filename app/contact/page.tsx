import ContactForm from "@/components/contact/ContactForm";
import { createMetadata } from "@/lib/metadata";
// Cache trong 1 giờ, hoặc thậm chí 1 ngày (86400)
export const revalidate = 3600;

export const metadata = createMetadata({
  title: "Liên hệ",
  description: "Liên hệ - Trao đổi công việc - Cộng tác - Tài trợ",
});

export default function ContactPage() {

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-semibold text-gray-900 text-2xl">
          Liên hệ
        </h1>
        <p className="text-sm text-gray-500">
          Trao đổi công việc - Cộng tác - Tài trợ
        </p>
      </div>

      {/* Contact form */}
      <ContactForm />
    </div>
  );
}