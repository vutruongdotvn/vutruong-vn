import ContactCard from "@/components/contact/ContactCard";
import ContactForm from "@/components/contact/ContactForm";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Liên hệ",
  description: "Liên hệ với mình",
});

export default function ContactPage() {
  const socials = [
    {
      name: "Email",
      url: "mailto:contact@vutruong.vn",
      display: "contact@vutruong.vn",
      gradient: "from-sky-300 to-sky-600",
      icon: "fa-duotone fa-envelope",
    },
    {
      name: "Điện thoại",
      url: "tel:0968999542",
      // display: "0968 999 542",
      gradient: "from-green-300 to-green-600",
      icon: "fa-duotone fa-phone",
    },
    {
      name: "Mạng xã hội",
      url: "/bio",
      // display: "Xem tất cả liên kết",
      gradient: "from-amber-300 to-amber-600",
      icon: "fa-duotone fa-message-dots",
    },
  ];

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-semibold text-gray-900 text-2xl">
          Liên hệ
        </h1>
        <p className="text-sm text-gray-500">
          Trao đổi công việc | Cộng tác | Tài trợ
        </p>
      </div>

      {/* Contact cards 
      <div className="space-y-4 text-left">
        {socials.map((item, index) => (
          <ContactCard
            key={index}
            name={item.name}
            display={item.display}
            href={item.url}
            icon={item.icon}
            gradient={item.gradient}
          />
        ))}
      </div>
      */}

      {/* Contact form */}
      <ContactForm />
    </div>
  );
}