"use client";

import { LayoutGroup, motion } from "framer-motion";
import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

type ThemeMode = "system" | "light" | "dark";

const THEME_OPTIONS: ReadonlyArray<{
  value: ThemeMode;
  label: string;
  icon: string;
}> = [
  { value: "system", label: "Hệ thống", icon: "fa-sliders" },
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
    <div className="group flex min-h-10 items-center justify-between gap-3 rounded-2xl px-4 py-1 transition-colors hover:bg-muted/60 mt-1.5">
      <div className="flex min-w-0 items-center gap-3">
        <i
          className="fa-duotone fa-circle-half-stroke w-5 shrink-0 text-center text-base text-muted-foreground transition-colors group-hover:text-foreground"
          aria-hidden="true"
        />
        <span className="truncate text-sm font-medium text-foreground">
          Theme
        </span>
      </div>

      <LayoutGroup id={layoutGroupId}>
        <div
          role="radiogroup"
          aria-label="Chọn giao diện"
          className="flex shrink-0 items-center gap-0.5 rounded-full bg-muted/80 p-1 dark:bg-black/20"
        >
          {THEME_OPTIONS.map((option) => {
            const active = mounted && theme === option.value;

            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={active}
                aria-label={option.label}
                title={option.label}
                disabled={!mounted}
                onClick={() => setTheme(option.value)}
                className={`relative grid size-8 shrink-0 place-items-center rounded-full text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:cursor-default ${
                  active
                    ? "text-foreground"
                    : "cursor-pointer text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="theme-switcher-active-pill"
                    initial={false}
                    transition={{
                      type: "spring",
                      stiffness: 450,
                      damping: 20,
                      mass: 0.7,
                    }}
                    className="pointer-events-none absolute inset-0 rounded-full bg-background shadow-sm dark:bg-white/20"
                    aria-hidden="true"
                  />
                )}

                <i
                  className={`fa-duotone ${option.icon} relative z-10 text-sm`}
                  aria-hidden="true"
                />
                <span className="sr-only">{option.label}</span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}