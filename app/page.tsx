'use client';

import Image from 'next/image';
import { useTheme } from 'next-themes';
import { Moon, Sun, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    setMounted(true);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          window.location.href = 'https://www.facebook.com/www.vutruong.vn';
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!mounted) return null;

  const isDark = theme === 'dark';

  return (
    <main className={`min-h-screen bg-gradient-to-br ${isDark ? 'from-gray-950 via-slate-950 to-gray-900' : 'from-gray-50 via-white to-blue-50/30'} text-${isDark ? 'slate-100' : 'gray-900'} flex items-center justify-center relative overflow-hidden px-4 sm:px-6 lg:px-8 transition-colors duration-500`}>
      {/* Subtle animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.05)_0%,transparent_60%)] animate-pulse-slow pointer-events-none" />

      {/* Theme toggle */}
      <button
        onClick={() => setTheme(isDark ? 'light' : 'dark')}
        className={`absolute top-5 right-5 sm:top-6 sm:right-6 p-2.5 sm:p-3 rounded-full backdrop-blur-md border shadow-md hover:scale-110 transition-all duration-300 z-30 ${isDark ? 'bg-slate-800/60 border-slate-600/40 hover:bg-slate-700/80' : 'bg-white/60 border-white/40 hover:bg-white/80'}`}
        aria-label="Toggle theme"
      >
        {isDark ? (
          <Sun className="w-5 h-5 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 text-gray-800" />
        )}
      </button>

      {/* Glass card */}
      <div className={`
        relative w-full max-w-md sm:max-w-lg md:max-w-xl mx-auto
        p-8 sm:p-10 md:p-12 rounded-3xl
        backdrop-blur-2xl border
        shadow-[0_20px_60px_rgba(0,0,0,0.10),inset_0_2px_1px_rgba(255,255,255,0.3)]
        overflow-hidden
        hover:scale-[1.015] hover:shadow-2xl transition-all duration-500 ease-out
        ${isDark ? 'bg-slate-800/30 border-slate-600/40' : 'bg-white/30 border-white/40'}
      `}>
        <div className="relative z-10">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="VT Logo"
              width={99}
              height={99}
              priority
              className="w-28 h-28 object-contain drop-shadow-2xl rounded-3xl ring-1 ring-white/30 pointer-events-none"
              quality={85}
            />
          </div>

          {/* Greeting */}
          <h1 className={`text-4xl md:text-5xl font-bold tracking-tight text-center mb-5 bg-gradient-to-r bg-clip-text text-transparent ${isDark ? 'from-slate-200 to-slate-400' : 'from-gray-900 to-gray-700'}`}>
            Hello ~
          </h1>

          {/* Main message */}
          <p className={`text-lg sm:text-xl font-normal text-center mb-6 leading-relaxed select-text ${isDark ? 'text-slate-300' : 'text-gray-700'}`}>
            Web đang build chưa có xong 🧐
          </p>

          {/* Countdown */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative w-20 h-20 sm:w-24 sm:h-24">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke={isDark ? '#334155' : '#e5e7eb'} strokeWidth="4" />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  strokeDasharray="282.6"
                  strokeDashoffset={282.6 * (countdown / 60)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                />
              </svg>
              <div className={`absolute inset-0 flex items-center justify-center text-xl sm:text-2xl font-bold ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                {countdown}
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className={`text-center text-base md:text-base ${isDark ? 'text-slate-400' : 'text-gray-600'} font-light`}>
            <span>Liên hệ qua email </span>
            <a
              href="mailto:contact@vutruong.vn"
              className={`inline-block transition-colors duration-200 font-normal ${isDark ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
            >
              contact@vutruong.vn
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className={`absolute bottom-4 sm:bottom-6 text-xs sm:text-sm font-medium ${isDark ? 'text-slate-500' : 'text-gray-500'}`}>
        © {new Date().getFullYear()} VT System by Next.js
      </footer>
    </main>
  );
}