"use client";
import React, { ReactNode, useEffect, useState } from "react";

const THEME_KEY = "site-theme";
type Theme = "light" | "dark" | "system";

function applyThemeClass(theme: Theme) {
  const el = document.documentElement;
  if (!el) return;

  if (theme === "light") {
    el.classList.add("light");
    el.classList.remove("dark");
  } else if (theme === "dark") {
    el.classList.add("dark");
    el.classList.remove("light");
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_KEY) as Theme | null;
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
        applyThemeClass(stored);
        return;
      }

      // No stored preference — respect OS preference
      const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initial = prefersDark ? "dark" : "light";
      setTheme(initial);
      applyThemeClass(initial);

      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const handleChange = (e: MediaQueryListEvent) => {
        const current = localStorage.getItem(THEME_KEY);
        if (!current) {
          const next = e.matches ? "dark" : "light";
          setTheme(next);
          applyThemeClass(next);
        }
      };

      if (mql.addEventListener) mql.addEventListener("change", handleChange);
      else mql.addListener && mql.addListener(handleChange);

      return () => {
        if (mql.removeEventListener) mql.removeEventListener("change", handleChange);
        else mql.removeListener && mql.removeListener(handleChange);
      };
    } catch (e) {
      // ignore (SSR / privacy blocking)
    }
  }, []);

  return <>{children}</>;
}

export function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(THEME_KEY) as Theme | null;
      if (stored === "light" || stored === "dark") {
        setTheme(stored);
      } else {
        const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(prefersDark ? "dark" : "light");
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const toggle = () => {
    const next: Theme = theme === "light" ? "dark" : "light";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch (e) {
      // ignore
    }
    setTheme(next);
    applyThemeClass(next);
  };

  if (!mounted) return <span className="btn-ghost p-2" aria-hidden />;

  return (
    <button
      onClick={toggle}
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className="btn-ghost p-2"
    >
      {theme === "light" ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M12 4V2M12 22v-2M4 12H2M22 12h-2M5 5l-1.5-1.5M20.5 20.5 19 19M19 5l1.5-1.5M4 19l1.5 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
