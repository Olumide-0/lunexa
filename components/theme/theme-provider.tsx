"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

const STORAGE_KEY = "lunexa-theme";

type ThemeContextValue = {
  theme: Theme; // what the visitor picked
  resolvedTheme: "light" | "dark"; // what is actually showing ("system" becomes light or dark)
  setTheme: (theme: Theme) => void;
  ready: boolean; // false until the saved choice has been read in the browser
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");
  const [systemDark, setSystemDark] = useState(false);
  const [ready, setReady] = useState(false);

  // Read the saved choice and the device setting once, in the browser.
  // (The <script> in app/layout.tsx has already set the right class, so there is no flash.)
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(STORAGE_KEY);
    } catch {
      // storage blocked: fall back to the device setting
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemDark(media.matches);
    if (saved === "light" || saved === "dark" || saved === "system") setThemeState(saved);
    setReady(true);

    // "System" follows the device when it switches between light and dark
    const handleChange = (event: MediaQueryListEvent) => setSystemDark(event.matches);
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, []);

  const resolvedTheme: "light" | "dark" = theme === "system" ? (systemDark ? "dark" : "light") : theme;

  // Put (or take off) the "dark" class on <html>. The CSS in globals.css does the rest.
  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [ready, resolvedTheme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // storage blocked: the choice only lasts until the page is closed
    }
  }, []);

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme, ready }), [theme, resolvedTheme, setTheme, ready]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used inside <ThemeProvider>");
  return context;
}