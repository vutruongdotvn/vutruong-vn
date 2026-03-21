import Image from "next/image";
import SocialCard from "@/components/bio/SocialCard";

export default function BioPage() {
  return (
    <div className="text-center my-12 space-y-8">

      {/* Logo */}

      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Kết nối với mình
        </h1>
        <p className="text-gray-500 text-sm">
          Qua mạng xã hội
        </p>
      </div>

      {/* Social list */}
      <div className="space-y-4 text-left">

        <SocialCard
          title="Facebook"
          subtitle="@www.vutruong.vn"
          href="//www.facebook.com/www.vutruong.vn"
          icon={<i className="fa-brands fa-facebook-f text-white text-2xl"></i>}
          iconBg="bg-gradient-to-br from-blue-500 to-blue-700"
        />

        <SocialCard
          title="TikTok"
          subtitle="@vutruong.vn"
          href="//www.tiktok.com/@vutruong.vn"
          icon={<i className="fa-brands fa-tiktok text-white text-2xl"></i>}
          iconBg="bg-gradient-to-br from-black to-gray-800"
        />

        <SocialCard
          title="Instagram"
          subtitle="@vutruong.vn"
          href="//www.instagram.com/vutruong.vn"
          icon={<i className="fa-brands fa-instagram text-white text-2xl"></i>}
          iconBg="bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500"
        />

        <SocialCard
          title="Threads"
          subtitle="@vutruong.vn"
          href="//www.threads.com/vutruong.vn"
          icon={<i className="fa-brands fa-threads text-white text-2xl"></i>}
          iconBg="bg-gradient-to-br from-gray-800 to-black"
        />

        <SocialCard
          title="Locket"
          subtitle="@vutruong.vn"
          href="https://locket.camera/links/UJpdrfjVHXXhmNe68"
          icon={<i className="fa-duotone fa-heart text-white text-2xl"></i>}
          iconBg="bg-gradient-to-br from-yellow-400 to-yellow-600"
        />

      </div>
    </div>
  );
}