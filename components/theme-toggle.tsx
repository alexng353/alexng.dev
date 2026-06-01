"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  // Default to dark to match the server-rendered <html class="dark">; the
  // effect re-syncs once the no-flash script has settled the real value.
  const [dark, setDark] = useState(true);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const isDark = document.documentElement.classList.toggle("dark");
    try {
      localStorage.setItem("theme", isDark ? "dark" : "light");
    } catch (_error) {
      // localStorage can be unavailable (private mode, blocked storage)
    }
    setDark(isDark);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark theme"
      className="fixed right-4 top-4 z-50 rounded-md border border-gray-300 bg-white/80 p-2 text-gray-700 backdrop-blur-sm transition-colors hover:border-green-500 dark:border-gray-700 dark:bg-black/50 dark:text-gray-300"
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
