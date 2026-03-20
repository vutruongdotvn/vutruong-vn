import Image from "next/image";
import ProjectCard from "@/components/project/ProjectCard";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Dự án",
  description: "Các dự án mình đã thực hiện",
});

export default function ProjectPage() {
  const projects = [
    {
      name: "VT System",
      description: "Hệ sinh thái số trên Internet",
      href: "https://vutruong.vn",
      icon: "fa-duotone fa-earth-asia",
      gradient: "from-olive-400 to-olive-600",
    },
    {
      name: "VT Welcome",
      description: "Trang chào mừng trên trình duyệt",
      href: "https://hi.vutruong.vn",
      icon: "fa-duotone fa-hand-wave",
      gradient: "from-sky-400 to-blue-600",
    },
    {
      name: "VT Restaurant",
      description: "Quán ăn Gia đình Vũ Trường",
      href: "https://quanangiadinh.vutruong.vn",
      icon: "fa-duotone fa-bowl-food",
      gradient: "from-orange-400 to-red-500",
    },
    {
      name: "VT Invoice",
      description: "Hệ thống quản lý hóa đơn & chi phí vận hành",
      href: "https://hoadon.vutruong.vn",
      icon: "fa-duotone fa-file-invoice",
      gradient: "from-emerald-400 to-green-600",
    },
    {
      name: "VT Films",
      description: "Trang xem phim nội bộ",
      href: "https://films.vutruong.vn",
      icon: "fa-duotone fa-film",
      gradient: "from-purple-400 to-indigo-600",
    },
    {
      name: "VT Zone",
      description: "Lưu giữ những điều đẹp đẽ & giá trị",
      href: "https://blog.vutruong.vn",
      icon: "fa-duotone fa-pen-nib",
      gradient: "from-pink-400 to-rose-500",
    },
    {
      name: "VT Secret",
      description: "Lưu trữ những tài khoản quan trọng",
      href: "https://id.vutruong.vn",
      icon: "fa-duotone fa-shield-keyhole",
      gradient: "from-gray-600 to-black",
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
          Dự án
        </h1>
        <p className="text-gray-500 text-sm">
          Những sản phẩm mình đã làm
        </p>
      </div>

      {/* List */}
      <div className="space-y-4 text-left">
        {projects.map((item, index) => (
          <ProjectCard
            key={index}
            name={item.name}
            description={item.description}
            href={item.href}
            icon={item.icon}
            gradient={item.gradient}
          />
        ))}
      </div>

    </div>
  );
}