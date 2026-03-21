import Countdown from "@/components/home/Countdown";
import GlassCard from "@/components/home/GlassCard";
import BackgroundGlow from "@/components/home/BackgroundGlow";
import Image from "next/image";
import {AppleHelloVietnameseEffect} from "@/components/apple-hello-effect";

export const metadata = {
  title: "Trang chủ",
};

export default function Page() {
  return (
    <main className="relative min-h-screen flex items-center justify-center">

      <BackgroundGlow />

      <GlassCard>
        <div className="text-center space-y-8">

          {/* Logo */}


          {/* Title */}
          <AppleHelloVietnameseEffect />

          {/* Subtitle */}
          <p className="text-gray-600 text-base">
            Chưa có ý tưởng gì để build cả 🫠
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