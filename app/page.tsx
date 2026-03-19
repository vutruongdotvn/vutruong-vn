"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Home() {
  const [timeLeft, setTimeLeft] = useState(60);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

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

  // Smooth parallax
  useEffect(() => {
    const move = (e: MouseEvent) => {
      setMouse({
        x: (e.clientX / window.innerWidth - 0.5) * 30,
        y: (e.clientY / window.innerHeight - 0.5) * 30,
      });
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  const progress = timeLeft / 60;
  const circumference = 2 * Math.PI * 45;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <main className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-gray-100 via-white to-gray-200">

      {/* Noise texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Background blobs */}
      <div className="absolute w-[600px] h-[600px] bg-blue-300/30 blur-3xl rounded-full top-[-150px] left-[-150px]" />
      <div className="absolute w-[500px] h-[500px] bg-purple-300/30 blur-3xl rounded-full bottom-[-150px] right-[-150px]" />

      {/* Glass Card */}
      <div
        className="relative w-[420px] p-10 rounded-[32px] backdrop-blur-2xl bg-white/40 border border-white/30 shadow-[0_30px_100px_rgba(0,0,0,0.2)] transition-all duration-300"
        style={{
          transform: `translate(${mouse.x}px, ${mouse.y}px)`,
        }}
      >
        {/* Light reflection */}
        <div
          className="absolute inset-0 rounded-[32px] pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${50 + mouse.x}% ${
              50 + mouse.y
            }%, rgba(255,255,255,0.6), transparent 60%)`,
          }}
        />

        {/* Inner glow */}
        <div className="absolute inset-0 rounded-[32px] bg-white/20 opacity-40" />

        <div className="relative text-center space-y-6">

          {/* Logo */}
          <div className="flex justify-center relative">
            <div className="p-0">
              <Image src="/logo.png" alt="logo" width={70} height={70} />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-semibold tracking-tight text-gray-800 mb-2">
            Hello
          </h1>

          {/* Subtitle */}
          <p className="text-gray-600 text-base mb-6">
            Website đang bảo trì để nâng cấp 🧐
          </p>

          {/* Circular Countdown */}
          <div className="flex justify-center items-center relative">
            <svg width="120" height="120" className="rotate-[-90deg]">
              <circle
                cx="60"
                cy="60"
                r="45"
                stroke="rgba(255,255,255,0.3)"
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

            {/* Time text */}
            <div className="absolute text-base font-semibold text-gray-700">
              {timeLeft}
            </div>
          </div>

          {/* Contact */}
          <p className="text-base font-light text-gray-500">
            contact@vutruong.vn
          </p>
        </div>
      </div>
    </main>
  );
}