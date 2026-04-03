export default function BioPage() {
  const socials = [
    {
      title: "Facebook",
      subtitle: "@www.vutruong.vn",
      href: "//www.facebook.com/www.vutruong.vn",
      icon: <i className="fa-brands fa-facebook-f text-2xl text-white" />,
      iconBg: "bg-gradient-to-br from-blue-500 to-blue-700",
    },
    {
      title: "TikTok",
      subtitle: "@vutruong.vn",
      href: "//www.tiktok.com/@vutruong.vn",
      icon: <i className="fa-brands fa-tiktok text-2xl text-white" />,
      iconBg: "bg-gradient-to-br from-black to-gray-800",
    },
    {
      title: "Instagram",
      subtitle: "@vutruong.vn",
      href: "//www.instagram.com/vutruong.vn",
      icon: <i className="fa-brands fa-instagram text-2xl text-white" />,
      iconBg: "bg-gradient-to-br from-pink-500 via-red-500 to-yellow-500",
    },
    {
      title: "Threads",
      subtitle: "@vutruong.vn",
      href: "//www.threads.com/vutruong.vn",
      icon: <i className="fa-brands fa-threads text-2xl text-white" />,
      iconBg: "bg-gradient-to-br from-gray-800 to-black",
    },
    {
      title: "Locket",
      subtitle: "@vutruong.vn",
      href: "https://locket.camera/links/UJpdrfjVHXXhmNe68",
      icon: <i className="fa-duotone fa-heart text-2xl text-white" />,
      iconBg: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    },
  ];

  return (
    <div className="space-y-8 text-center">
      {/* Logo */}

      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Biography</h1>
        <p className="text-sm text-gray-500">Liên kết mạng xã hội</p>
      </div>

      {/* Social list */}
      <div className="space-y-4 text-left">
        {socials.map((social, index) => {
          const isExternal =
            social.href.startsWith("http") || social.href.startsWith("//");

          return (
            <a
              key={index}
              href={social.href}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="group flex items-center justify-between rounded-xl border border-white/50 bg-white/70 p-5 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/90 hover:shadow-xl"
            >
              <div className="flex items-center gap-4">
                {/* ICON */}
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${social.iconBg}`}
                >
                  {social.icon}
                </div>

                {/* TEXT */}
                <div className="flex flex-col justify-center">
                  <p className="font-semibold leading-tight text-gray-900">
                    {social.title}
                  </p>
                  <p className="text-sm leading-tight text-gray-500">
                    {social.subtitle}
                  </p>
                </div>
              </div>

              <i className="fa-regular fa-arrow-right text-gray-400 transition group-hover:translate-x-1 group-hover:text-gray-600" />
            </a>
          );
        })}
      </div>
    </div>
  );
}