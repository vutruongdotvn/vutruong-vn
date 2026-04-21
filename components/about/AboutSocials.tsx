export const revalidate = 3600; // cache 1h

export default function AboutSocials() {
  const socials = [
    { title: "Facebook", 
      subtitle: "www.vutruong.vn", 
      href: "https://www.facebook.com/www.vutruong.vn", 
      icon: "fa-facebook-f", 
      color: "text-[#1877F2]", 
      bg: "bg-[#1877F2]/10", hover: "hover:bg-[#1877F2]/20" },

    { title: "Instagram", 
      subtitle: "vutruong.vn", 
      href: "https://www.instagram.com/vutruong.vn", 
      icon: "fa-instagram", 
      color: "text-[#E4405F]", 
      bg: "bg-[#E4405F]/10", hover: "hover:bg-[#E4405F]/20" },

    { title: "TikTok", 
      subtitle: "vutruong.vn", 
      href: "https://www.tiktok.com/@vutruong.vn", 
      icon: "fa-tiktok", 
      color: "text-slate-900", 
      bg: "bg-slate-200", hover: "hover:bg-slate-300" },

    { title: "Threads", 
      subtitle: "vutruong.vn", 
      href: "https://www.threads.com/vutruong.vn", 
      icon: "fa-threads", 
      color: "text-slate-900", 
      bg: "bg-slate-200", hover: "hover:bg-slate-300" },

    { title: "X", 
      subtitle: "vutruong.vn", 
      href: "https://x.com/vutruong.vn", 
      icon: "fa-x-twitter", 
      color: "text-slate-900", 
      bg: "bg-slate-200", hover: "hover:bg-slate-300" },

    { title: "Locket", 
      subtitle: "vutruong.vn", 
      href: "https://locket.camera/links/UJpdrfjVHXXhmNe68", 
      icon: "fa-heart", 
      color: "text-[#FFB800]", 
      bg: "bg-[#FFB800]/10", hover: "hover:bg-[#FFB800]/20", 
      isDuotone: true },
  ];

  return (
    <section className="animate-in fade-in duration-1000 fill-mode-both">
      <div className="mb-6">
        <h3 className="text-lg sm:text-xl font-bold text-slate-900">Kết nối với mình</h3>
        <p className="text-slate-500 text-sm mt-1">Trên các nền tảng mạng xã hội</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {socials.map((social, index) => (
          <a
            key={index}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-300 ${social.bg} ${social.hover} active:scale-95`}
          >
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white shadow-sm ${social.color}`}>
              <i className={`${social.isDuotone ? 'fa-duotone' : 'fa-brands'} ${social.icon} text-xl`} />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-sm text-slate-900 truncate hidden">{social.title}</p>
              <p className="text-sm font-medium text-slate-500 truncate">{social.subtitle}</p>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}