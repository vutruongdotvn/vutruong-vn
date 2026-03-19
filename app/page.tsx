"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(60);

  // Countdown
  useEffect(() => {
    if (timeLeft <= 0) {
      window.location.href = "https://fb.com/100014201562904";
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const progress = timeLeft / 60;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 via-white to-gray-200">

      {/* Subtle background glow */}
      <div className="absolute w-[500px] h-[500px] bg-blue-200/30 blur-3xl rounded-full top-[-150px] left-[-150px]" />
      <div className="absolute w-[400px] h-[400px] bg-purple-200/30 blur-3xl rounded-full bottom-[-150px] right-[-150px]" />

      {/* Glass Card */}
      <div className="relative w-[420px] p-10 rounded-[28px] bg-white/70 backdrop-blur-xl border border-white/50 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">

        <div className="text-center space-y-6">

          {/* Logo */}
          <div className="flex justify-center">
            <Image src="/logo.png" alt="logo" width={70} height={70} priority />
          </div>

          {/* Title */}
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
            Hello
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-base">
            Ở đây không có gì cả 🧐
          </p>

          {/* Circular Countdown */}
          <div className="flex justify-center items-center relative">
            <svg width="120" height="120" className="-rotate-90">
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="rgba(0,0,0,0.08)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="url(#grad)"
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-linear"
              />
              <defs>
                <linearGradient id="grad">
                  <stop offset="0%" stopColor="#60a5fa" />
                  <stop offset="100%" stopColor="#2563eb" />
                </linearGradient>
              </defs>
            </svg>

            {/* Time */}
            <div className="absolute text-base font-semibold text-gray-800">
              {timeLeft}
            </div>
          </div>

          {/* Contact */}
          <p className="text-sm text-gray-500">
            Liên hệ <a href="/contact" className="font-bold text-gray-600">contact@vutruong.vn</a> hoặc <a className="text-gray-600 font-bold" href="/bio">bio</a>
          </p>
        </div>
      </div>
    </main>
  );
}