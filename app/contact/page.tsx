import Image from "next/image";
import ContactCard from "@/components/contact/ContactCard";
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
      gradient: "from-green-300 to-green-600",
      icon: "fa-duotone fa-phone",
    },
    {
      name: "Mạng xã hội",
      url: "/bio",
      gradient: "from-amber-300 to-amber-600",
      icon: "fa-duotone fa-message-dots",
    },
  ];

  return (
    <div className="text-center my-12 space-y-8">

      {/* Logo */}
      <div className="flex justify-center">
        <a href="/">
          <Image src="/logo.png" alt="logo" width={70} height={70} priority />
        </a>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Liên hệ với mình
        </h1>
        <p className="text-gray-500 text-sm">
          Qua các kênh dưới đây
        </p>
      </div>

      {/* List */}
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

    </div>
  );
}