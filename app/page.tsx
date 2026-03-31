"use client";

import { useEffect, useMemo, useState } from "react";
import { AppleHelloVietnameseEffect } from "@/components/apple-hello-effect";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";

const rotatingWords = ["code 🧑‍💻", "cà phê ☕", "âm nhạc 🎵🎤", "guitar 🎸", "du lịch 🌊"];

export default function Page() {
  const [helloKey, setHelloKey] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const helloInterval = setInterval(() => {
      setHelloKey((prev) => prev + 1);
    }, 15000);

    return () => clearInterval(helloInterval);
  }, []);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2200);

    return () => clearInterval(wordInterval);
  }, []);

  const activeWord = useMemo(() => rotatingWords[wordIndex], [wordIndex]);

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-16">

      <div className="mx-auto flex min-h-full max-w-4xl flex-col items-center justify-center">
        <PremiumGlassCard
          className="max-w-2xl pointer-events-none select-none"
          contentClassName="p-12 px-24 text-center"
        >
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-4 py-1.5 text-xs font-medium text-emerald-600">
              <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
              </span>
              Personal digital ecosystem
            </span>
          </div>

          {/* Hello */}
          <div key={helloKey} className="animate-fadeIn">
            <AppleHelloVietnameseEffect />
          </div>

          {/* Tagline */}
          <div className="mt-6 space-y-2">
            <p className="text-base md:text-lg font-semibold text-gray-800">Welcome to...</p>
            <p className="mx-auto max-w-2xl text-sm leading-7 text-gray-600 md:text-base">
              Hệ sinh thái số cá nhân của mình trên Internet,
              <br />
              Xây dựng những thứ mình thích chỉ với những dòng code.
            </p>

            <div className="overflow-hidden">
              <p className="mt-5 text-sm text-gray-600 md:text-base">
                Cuộc sống đơn giản với{" "}
                <span
                  key={activeWord}
                  className="inline-block min-w-[max-content] animate-fade-word font-semibold text-gray-800"
                >
                  {activeWord}
                </span>
              </p>
            </div>
          </div>
        </PremiumGlassCard>

        <p className="mt-8 text-sm/6 text-gray-400 pointer-events-none select-none">Vibes & Clean | Powered by Next.js, Vercel, Cloudinary & Supabase.</p>

      </div>
    </main>
  );
}