"use client";

import { useEffect, type ReactNode } from "react";
import {
  ThemeProvider as NextThemesProvider,
  useTheme,
} from "next-themes";

type ThemeProviderProps = {
  children: ReactNode;
};

function ThemeColorSync() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="theme-color"][data-vt-theme]',
    );

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.dataset.vtTheme = "true";
      document.head.appendChild(meta);
    }

    meta.content = resolvedTheme === "dark" ? "#18191a" : "#f2f3f5";
  }, [resolvedTheme]);

  return null;
}

export default function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      enableColorScheme
      storageKey="vt-zone-theme"
      disableTransitionOnChange
    >
      <ThemeColorSync />
      {children}
    </NextThemesProvider>
  );
}
