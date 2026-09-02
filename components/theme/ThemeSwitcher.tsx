"use client";

import { useEffect, useId, useState } from "react";
import { useTheme } from "next-themes";
import { LayoutGroup, motion } from "framer-motion";

type ThemeMode = "system" | "light" | "dark";

const THEME_OPTIONS: Array<{
  value: ThemeMode;
  label: string;
  icon: string;
}> = [
  { value: "system", label: "Hệ thống", icon: "fa-laptop" },
  { value: "light", label: "Sáng", icon: "fa-sun-bright" },
  { value: "dark", label: "Tối", icon: "fa-moon" },
];

export default function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const layoutGroupId = useId();

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="">
      <LayoutGroup id={layoutGroupId}>
        <div
          role="radiogroup"
          aria-label="Chọn giao diện"
          className="grid grid-cols-3 gap-1"
        >
          {THEME_OPTIONS.map((option) => {
            const active = mounted && theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                disabled={!mounted}
                onClick={() => setTheme(option.value)}
                className={`relative flex min-w-0 cursor-pointer flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors disabled:cursor-default ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:bg-card/70 hover:text-foreground "
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="theme-switcher-active-pill"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 35,
                      mass: 0.7,
                    }}
                    className="pointer-events-none absolute inset-0 rounded-xl bg-background shadow-sm"
                    aria-hidden="true"
                  />
                )}

                <i
                  className={`fa-duotone ${option.icon} relative z-10 text-sm`}
                  aria-hidden="true"
                />
                <span className="relative z-10 truncate">{option.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}