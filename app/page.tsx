"use client";

import { useEffect, useState } from "react";

// import Countdown from "@/components/home/Countdown";
import GlassCard from "@/components/home/GlassCard";
import BackgroundGlow from "@/components/home/BackgroundGlow";
import { AppleHelloVietnameseEffect } from "@/components/apple-hello-effect";

export default function Page() {
  const [key, setKey] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setKey((prev) => prev + 1);
    }, 12000); // 🔥 loop chuẩn theo animation (~7–8s)

    return () => clearInterval(interval);
  }, []);

  return (
    <main className="relative min-h-screen flex items-center justify-center">
      <BackgroundGlow />

      <GlassCard>
        <div className="text-center space-y-8">
          {/* Title */}
          <div key={key} className="animate-fadeIn">
            <AppleHelloVietnameseEffect />
          </div>
          {/* <Countdown /> */}
        </div>
      </GlassCard>
    </main>
  );
}