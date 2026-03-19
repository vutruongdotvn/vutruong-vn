"use client";

import Link from "next/link";
import Image from "next/image";

const socials = [
  {
    name: "Facebook",
    username: "facebook.com/100014201562904",
    url: "https://facebook.com/100014201562904",
    color: "from-blue-500 to-blue-600",
    icon: "/icons/facebook.svg",
  },
  {
    name: "TikTok",
    username: "tiktok.com/@vutruong.vn",
    url: "https://tiktok.com/@vutruong.vn",
    color: "from-black to-gray-800",
    icon: "/icons/tiktok.svg",
  },
  {
    name: "Instagram",
    username: "instagram.com/vutruong.vn",
    url: "https://instagram.com/vutruong.vn",
    color: "from-pink-500 via-red-500 to-yellow-500",
    icon: "/icons/instagram.svg",
  },
];

export default function BioPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 via-white to-gray-200 flex items-center justify-center px-6 py-16">

      {/* Background glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-200/30 blur-3xl rounded-full top-[-150px] left-[-150px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-200/30 blur-3xl rounded-full bottom-[-150px] right-[-150px]" />

      <div className="relative w-full max-w-xl">

        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Image src="/logo.png" alt="logo" width={60} height={60} />
          </div>

          <h1 className="text-3xl font-semibold text-gray-900 tracking-tight">
            Vũ Trường
          </h1>

          <p className="text-gray-500 mt-2">
            Kết nối với mình qua các nền tảng bên dưới
          </p>
        </div>

        {/* Social Cards */}
        <div className="space-y-5">

          {socials.map((item, index) => (
            <Link
              key={index}
              href={item.url}
              target="_blank"
              className="group block"
            >
              <div className="relative rounded-2xl p-[1px] bg-gradient-to-r from-white/40 to-white/10 backdrop-blur-xl border border-white/40 shadow-[0_10px_40px_rgba(0,0,0,0.1)] transition-all duration-300 hover:scale-[1.02]">

                {/* Inner card */}
                <div className="flex items-center justify-between rounded-2xl bg-white/80 px-5 py-4">

                  {/* Left */}
                  <div className="flex items-center gap-4">
                    
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${item.color} shadow-md`}>
                      <Image
                        src={item.icon}
                        alt={item.name}
                        width={22}
                        height={22}
                      />
                    </div>

                    {/* Text */}
                    <div>
                      <p className="font-medium text-gray-900">
                        {item.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.username}
                      </p>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="text-gray-400 group-hover:translate-x-1 transition">
                    →
                  </div>

                </div>
              </div>
            </Link>
          ))}

        </div>

      </div>
    </main>
  );
}