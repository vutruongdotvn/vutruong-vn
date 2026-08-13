import Link from "next/link";
export const revalidate = 3600;
export default function AboutProjects() {
  // Dữ liệu bốc từ project/page.tsx cũ sang
  const projects = [
    { name: "VT Zone", description: "Hệ sinh thái số cá nhân", href: "/", icon: "fa-earth-asia", gradient: "from-olive-400 to-olive-600" },
    { name: "VT Hi", description: "Trang chào mừng trên trình duyệt", href: "/hi", icon: "fa-hand-wave", gradient: "from-sky-400 to-blue-600" },
    { name: "VT Restaurant", description: "Quán ăn Gia đình Vũ Trường", href: "https://quanangiadinh.vutruong.vn", icon: "fa-bowl-food", gradient: "from-orange-400 to-red-500" },
    { name: "VT Invoice", description: "Hệ thống quản lý & vận hành Quán ăn", href: "https://hoadon.vutruong.vn", icon: "fa-file-invoice", gradient: "from-emerald-400 to-green-600" },
    { name: "VT Watch", description: "Trang xem phim cá nhân", href: "/watch", icon: "fa-film", gradient: "from-purple-400 to-indigo-600" },
    { name: "VT Blog", description: "Blog cá nhân", href: "/blog", icon: "fa-pen-nib", gradient: "from-pink-400 to-rose-500" },
    { name: "VT Secret", description: "Hệ thống lưu trữ tài khoản", href: "/secret", icon: "fa-shield-keyhole", gradient: "from-gray-600 to-black" },
    { name: "VT Admin", description: "Hệ thống quản lý và điều hành nội bộ", href: "/admin", icon: "fa-user-gear", gradient: "from-gray-600 to-black" },
    { name: "Coming Soon", description: "Một sản phẩm thú vị khác", href: "", icon: "fa-question", gradient: "from-gray-400 to-gray-400" },
  ];

  return (
    <section className="animate-in fade-in duration-1000 fill-mode-both">
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">Dự án cá nhân</h3>
        <p className="text-slate-500 text-sm mt-1">Những sản phẩm đã làm</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {projects.map((project, index) => {
          const isExternal = project.href.startsWith("http");

          const CardContent = (
            <div className="relative group h-full flex items-center sm:items-start gap-4 rounded-2xl border border-2 border-slate-200 bg-white/50 p-3 sm:p-5 duration-300 hover:-translate-y-1 hover:bg-white/90 active:scale-95 hover:shadow-[0_20px_40px_rgba(0,0,0,0.075)]">
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${project.gradient} text-xl text-white shadow-inner`}>
                  <i className={`fa-duotone ${project.icon}`} />
                </div>
              </div>
              <div className="">
                <p className="font-bold text-slate-900">{project.name}</p>
                <p className="text-sm text-slate-500 line-clamp-1">{project.description}</p>
              </div>
              <div className="absolute right-0 top-0 m-4 md:m-6 hidden">
                <i className={`fa-duotone ${isExternal ? "fa-arrow-up-right" : "fa-arrow-right"} text-slate-300 transition-all group-hover:text-slate-600 group-hover:translate-x-1 ${isExternal ? "group-hover:-translate-y-1" : ""}`} />
              </div>
            </div>
          );

          return isExternal ? (
            <a key={index} href={project.href} target="_blank" rel="noopener noreferrer">
              {CardContent}
            </a>
          ) : (
            <Link key={index} href={project.href} prefetch={false}>
              {CardContent}
            </Link>
          );
        })}
      </div>
    </section>
  );
}