import Image from "next/image";
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Bio',
  description: 'Trang danh sách các liên kết mạng xã hội của Vũ Trường',
};

export default function BioPage() {
  const socials = [
    {
      name: "Facebook",
      url: "https://facebook.com/100014201562904",
      // display: "@www.vutruong.vn",
      color: "from-blue-500 to-blue-600",
      icon: "fa-brands fa-facebook-f",
    },
    {
      name: "TikTok",
      url: "https://tiktok.com/@vutruong.vn",
      // display: "@vutruong.vn",
      color: "from-black to-neutral-800",
      icon: "fa-brands fa-tiktok",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/vutruong.vn",
      // display: "@vutruong.vn",
      color: "from-pink-500 via-red-500 to-yellow-500",
      icon: "fa-brands fa-instagram",
    },
    {
      name: "Threads",
      url: "https://threads.com/vutruong.vn",
      // display: "@vutruong.vn",
      color: "from-black to-black",
      icon: "fa-brands fa-threads",
    },
  ];

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 px-4 overflow-hidden">
      {/* background blur */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.6),transparent_60%)]" />

      <div className="relative w-full max-w-xl">
        {/* header */}
        <div className="text-center mb-10">
          <Image className='mx-auto mb-4' src="/logo.png" alt="logo" width={70} height={70} priority />

          <p className="text-gray-500 text-sm mt-1">
            Kết nối với mình qua mạng xã hội
          </p>
        </div>

        {/* list */}
        <div className="space-y-4">
          {socials.map((item, index) => (
            <a
              key={index}
              href={item.url}
              target="_blank"
              className="group flex items-center justify-between p-4 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/40 shadow-md hover:shadow-lg transition-all hover:scale-102"
            >
              <div className="flex items-center gap-4">
                {/* icon */}
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} text-white text-2xl`}
                >
                  <i className={`${item.icon}`} />
                </div>

                <div>
                  <p className="font-medium text-gray-900">
                    {item.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.display}
                  </p>
                </div>
              </div>

              {/* arrow */}
              <i className="fa-duotone fa-arrow-right text-gray-400 group-hover:translate-x-1 transition" />
            </a>
          ))}
        </div>

      </div>
    </main>
  );
}