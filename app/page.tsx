"use client";

import { useEffect, useMemo, useState } from "react";
import { AppleHelloVietnameseEffect } from "@/components/apple-hello-effect";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";

const rotatingWords = [
  "code 🧑‍💻",
  "cà phê sữa ☕",
  "nhạc 🎵🎸🎤",
  "dạo 🌊",
];

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
          className="max-w-2xl hover:scale-102 transition duration-800 ease-out"
          contentClassName="p-12 px-24 text-center"
        >
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-300 bg-teal-100 px-4 py-1.5 text-xs font-medium text-teal-600">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-teal-500" />
              </span>
              Personal digital ecosystem
            </span>
          </div>

          {/* Hello */}
          <div key={helloKey}>
            <AppleHelloVietnameseEffect />
          </div>

          {/* Tagline */}
          <div className="mt-6 space-y-2">
            <p className="text-base md:text-lg font-semibold text-gray-800">Welcome to 👋</p>
            <p className="mx-auto max-w-2xl text-sm text-gray-600 md:text-base/7">
              Hệ sinh thái số cá nhân của mình,
              <br />
              Xây dựng những thứ mình thích chỉ với những dòng code.
            </p>

            <div className="overflow-hidden">
              <p className="mt-5 text-sm text-gray-600 md:text-base">
                Cuộc sống giản dị với.. {" "}
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

      </div>
    </main>
  );
}