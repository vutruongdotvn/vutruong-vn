"use client";

import { useEffect, useMemo, useState } from "react";
import { AppleHelloVietnameseEffect } from "@/components/apple-hello-effect";
import PremiumGlassCard from "@/components/ui/PremiumGlassCard";

const rotatingWords = [
  "ăn",
  "ngủ",
  "code",
  "cà phê sữa",
  "đi dạo",
  "đạp xe",
  "leo núi",
  "xem phim",
  "nghe nhạc",
  "chơi guitar",
];

export default function Page() {
  const [helloKey, setHelloKey] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const helloInterval = setInterval(() => {
      setHelloKey((prev) => prev + 1);
    }, 12000);

    return () => clearInterval(helloInterval);
  }, []);

  useEffect(() => {
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 1500);

    return () => clearInterval(wordInterval);
  }, []);

  const activeWord = useMemo(() => rotatingWords[wordIndex], [wordIndex]);

  return (
    <main className="relative min-h-screen flex items-center justify-center py-20">

      <div className="mx-auto flex min-h-full w-full flex-col items-center justify-center">
        <PremiumGlassCard
          className="text-center max-w-6xl"
          contentClassName="py-36 sm:py-48 select-none"
        >
          {/* Badge 
          <div className="flex justify-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-teal-300 dark:border-teal-400/25 bg-teal-100 dark:bg-teal-400/15 px-4 py-1.5 text-xs font-medium text-teal-600 dark:text-teal-300">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-500 opacity-75"></span>
                <span className="relative inline-flex size-2 rounded-full bg-teal-500" />
              </span>
              Personal digital ecosystem
            </span>
          </div>
          */}

          {/* Hello */}
          <div key={helloKey}>
            <AppleHelloVietnameseEffect className="lg:h-20 md:h-18 h-16 mx-auto" />
          </div>

          {/* Tagline 
          <div className="space-y-1">
            <div className="overflow-hidden">
              <p className="text-sm text-foreground/75 sm:text-base">
                Cuộc sống chỉ xoay quanh {" "}
                <span
                  key={activeWord}
                  className="animate-fade-word font-medium text-foreground"
                >
                  {activeWord}
                </span>
                {" "}
                <span>😇</span>
              </p>
            </div>
          </div>
          */}

        </PremiumGlassCard>

      </div>
    </main>
  );
}