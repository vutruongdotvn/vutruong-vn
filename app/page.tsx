"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AppleHelloVietnameseEffect } from "@/components/apple-hello-effect";

const rotatingWords = ["code", "cà phê", "âm nhạc", "guitar", "du lịch"];

export default function Page() {
  const [helloKey, setHelloKey] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 });
  const heroRef = useRef<HTMLDivElement | null>(null);

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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!heroRef.current) return;

    const rect = heroRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const rotateY = ((x - 50) / 50) * 4;
    const rotateX = ((50 - y) / 50) * 4;

    setMouse({ x, y });
    setTilt({ rotateX, rotateY });
  };

  const resetTilt = () => {
    setTilt({ rotateX: 0, rotateY: 0 });
    setMouse({ x: 50, y: 50 });
  };

  return (
    <main className="relative min-h-screen flex items-center justify-center px-6 pt-28 pb-16">
      {/* Floating cinematic symbols */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[10%] top-[18%] animate-[floatY_8s_ease-in-out_infinite] text-xl text-black/10">
          ✦
        </div>
        <div className="absolute right-[14%] top-[24%] animate-[floatY_10s_ease-in-out_infinite] text-sm text-black/10">
          &lt;/&gt;
        </div>
        <div className="absolute left-[18%] bottom-[20%] animate-[floatY_9s_ease-in-out_infinite] text-base text-black/10">
          #
        </div>
        <div className="absolute right-[20%] bottom-[16%] animate-[floatY_11s_ease-in-out_infinite] text-lg text-black/10">
          ∞
        </div>
        <div className="absolute left-[48%] top-[12%] animate-[floatY_12s_ease-in-out_infinite] text-sm text-black/10">
          []
        </div>
      </div>

      <div className="mx-auto flex min-h-full max-w-4xl flex-col items-center justify-center">
        {/* HERO */}
        <section
          ref={heroRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          className="group perspective-[2000px] w-full max-w-2xl"
        >
          <div
            className="relative overflow-hidden rounded-0 sm:rounded-2xl border border-white/60 bg-white/45 shadow-[0_30px_120px_rgba(0,0,0,0.10)]
            backdrop-blur-2xl transition-transform duration-200 ease-out p-12 px-24"
            style={{
              transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
              transformStyle: "preserve-3d",
            }}
          >
            {/* Spotlight */}
            <div
              className="pointer-events-none absolute inset-0 transition duration-300"
              style={{
                background: `radial-gradient(circle at ${mouse.x}% ${mouse.y}%, rgba(255,255,255,0.95), rgba(255,255,255,0.25) 18%, transparent 52%)`,
              }}
            />

            {/* Premium border light */}
            <div className="pointer-events-none absolute inset-0 rounded-2xl border border-white/50" />

            {/* Soft top light */}
            <div className="pointer-events-none absolute inset-x-10 top-0 h-36 bg-gradient-to-b from-white/90 to-transparent blur-2xl" />

            {/* Floating orb */}
            <div className="pointer-events-none absolute -right-10 top-10 h-32 w-32 rounded-full bg-white/40 blur-3xl" />
            <div className="pointer-events-none absolute -left-8 bottom-8 h-24 w-24 rounded-full bg-blue-100/50 blur-3xl" />

            <div className="relative z-10 text-center [transform:translateZ(40px)]">
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
                  Xây dựng những thứ mình thích chỉ với những dòng code.
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
            </div>
          </div>
        </section>

        {/* Footer note */}
        <div className="mt-10 text-center">
          <p className="text-sm text-neutral-400">
            Built with Next.js, Supabase & ❤️
          </p>
        </div>
      </div>
    </main>
  );
}
