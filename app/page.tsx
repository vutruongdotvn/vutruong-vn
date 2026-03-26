"use client";

import { useEffect, useMemo, useState } from "react";
import { AppleHelloVietnameseEffect } from "@/components/apple-hello-effect";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";
import FloatingSymbols from "@/components/ui/FloatingSymbols";

const rotatingWords = ["code", "cà phê", "âm nhạc", "guitar", "du lịch"];

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
      <FloatingSymbols />

      <div className="mx-auto flex min-h-full max-w-4xl flex-col items-center justify-center">
        <PremiumGlassCard
          className="max-w-2xl"
          contentClassName="p-12 px-24 text-center"
        >
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-100 px-4 py-1.5 text-xs font-medium text-neutral-600 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Personal digital ecosystem
            </span>
          </div>

          {/* Hello */}
          <div key={helloKey} className="animate-fadeIn">
            <AppleHelloVietnameseEffect />
          </div>

          {/* Tagline */}
          <div className="mt-6 space-y-2">
            <p className="mx-auto max-w-2xl text-sm leading-7 text-neutral-500 md:text-base">
              Đây là không gian của mình trên Internet.
              <br />
              Xây dựng những thứ mình thích chỉ với các dòng code.
            </p>

            <div className="overflow-hidden">
              <p className="mt-5 text-sm text-neutral-500 md:text-base">
                Cuộc sống đơn giản với{" "}
                <span
                  key={activeWord}
                  className="inline-block min-w-[max-content] animate-fade-word font-semibold text-neutral-900"
                >
                  {activeWord}
                </span>
                <span> 😊</span>
              </p>
            </div>
          </div>
        </PremiumGlassCard>

      </div>
    </main>
  );
}