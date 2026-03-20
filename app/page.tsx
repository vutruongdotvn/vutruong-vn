import Countdown from "@/components/home/Countdown";
import GlassCard from "@/components/home/GlassCard";
import BackgroundGlow from "@/components/home/BackgroundGlow";
import Image from "next/image";

export const metadata = {
  title: "Trang chủ",
};

export default function Page() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">

      <BackgroundGlow />

      <GlassCard>
        <div className="text-center space-y-6">

          {/* Logo */}
          <div className="flex justify-center">
            <a href="/">
              <Image src="/logo.png" alt="logo" width={70} height={70} priority />
            </a>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Hello
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-base">
            Không có gì ở đây cả 🧐
          </p>

          <Countdown />

          {/* Contact */}
          <p className="text-sm text-gray-600">
            <a href="/contact" className="font-medium hover:text-gray-800">
              Liên hệ
            </a>
            <span className="mx-2 text-gray-600 font-bold">•</span>
            <a href="/bio" className="font-medium hover:text-gray-800">
              Mạng xã hội
            </a>
            <span className="mx-2 text-gray-600 font-bold">•</span>
            <a href="/project" className="font-medium hover:text-gray-800">
              Dự án
            </a>
          </p>

        </div>
      </GlassCard>
    </main>
  );
}