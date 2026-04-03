import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Dự án",
  description: "Các dự án mình đã thực hiện",
});

export default function ProjectPage() {
  const projects = [
    {
      name: "VT Zone",
      description: "Hệ sinh thái số cá nhân",
      href: "/",
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
      description: "Hệ thống quản lý & vận hành Quán ăn",
      href: "https://hoadon.vutruong.vn",
      icon: "fa-duotone fa-file-invoice",
      gradient: "from-emerald-400 to-green-600",
    },
    {
      name: "VT Films",
      description: "Trang xem phim cá nhân - nội bộ",
      href: "https://films.vutruong.vn",
      icon: "fa-duotone fa-film",
      gradient: "from-purple-400 to-indigo-600",
    },
    {
      name: "VT Blog",
      description: "Blog cá nhân - lưu giữ những điều giá trị",
      href: "/blog",
      icon: "fa-duotone fa-pen-nib",
      gradient: "from-pink-400 to-rose-500",
    },
    {
      name: "VT Secret",
      description: "Lưu trữ những tài khoản quan trọng",
      href: "/secret",
      icon: "fa-duotone fa-shield-keyhole",
      gradient: "from-gray-600 to-black",
    },
  ];

  return (
    <div className="text-center space-y-8">
      {/* Logo */}

      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Dự án</h1>
        <p className="text-gray-500 text-sm">Những sản phẩm đã làm</p>
      </div>

      {/* List */}
      <div className="space-y-4 text-left">
        {projects.map((project, index) => {
          const isExternal = project.href.startsWith("http");

          return (
            <a
              key={index}
              href={project.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="group block rounded-xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-xl"
            >
              <div className="flex items-center gap-4">
                {/* ICON */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${project.gradient} text-2xl text-white shadow-inner`}
                >
                  <i className={project.icon} />
                </div>

                {/* TEXT */}
                <div className="flex-1">
                  <p className="font-semibold leading-tight text-gray-900">
                    {project.name}
                  </p>
                  <p className="mt-1 text-sm leading-tight text-gray-500">
                    {project.description}
                  </p>
                </div>

                {/* ARROW */}
                <i className="fa-duotone fa-arrow-up-right text-gray-400 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-gray-600" />
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}