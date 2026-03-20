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

          {/* Footer Card */}
          <p className="text-sm text-gray-400">
            Đang chuyển hướng về Facebook á
          </p>

        </div>
      </GlassCard>
    </main>
  );
}