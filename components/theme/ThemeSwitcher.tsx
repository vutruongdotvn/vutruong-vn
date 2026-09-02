"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

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
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="rounded-2xl border border-border bg-muted/45 p-1.5">
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
              className={`flex min-w-0 cursor-pointer flex-col items-center gap-1 rounded-xl px-2 py-2 text-xs font-medium transition-colors disabled:cursor-default ${
                active
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-card/70 hover:text-foreground"
              }`}
            >
              <i
                className={`fa-duotone ${option.icon} text-sm`}
                aria-hidden="true"
              />
              <span className="truncate">{option.label}</span>
            </button>
          );
        })}
      </div>

      <p
        className={`px-2 pb-1 pt-2 text-center text-[11px] text-muted-foreground ${
          mounted ? "opacity-100" : "opacity-0"
        }`}
        aria-live="polite"
      >
        {theme === "system"
          ? `Hệ thống hiện đang dùng: ${resolvedTheme === "dark" ? "Tối" : "Sáng"}`
          : `Đang dùng giao diện ${resolvedTheme === "dark" ? "Tối" : "Sáng"}`}
      </p>
    </div>
  );
}
