import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

const THEME_KEY = "brauza:theme";

export function ThemeToggle() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const apply = (value: string | null) => {
      const next = value === "light" ? "light" : "dark";
      setTheme(next);
      document.documentElement.classList.toggle("light", next === "light");
      document.documentElement.classList.toggle("dark", next === "dark");
    };
    try {
      apply(localStorage.getItem(THEME_KEY));
    } catch {
      apply(null);
    }
    const sync = (event: StorageEvent) => {
      if (event.key === THEME_KEY) apply(event.newValue);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, []);

  const label = theme === "dark" ? "Ativar tema claro" : "Ativar tema escuro";

  return (
    <Button
      variant="ghost"
      size="icon"
      className="min-h-11 min-w-11"
      aria-label={label}
      title={label}
      onClick={() => {
        const next = theme === "dark" ? "light" : "dark";
        setTheme(next);
        document.documentElement.classList.toggle("light", next === "light");
        document.documentElement.classList.toggle("dark", next === "dark");
        try {
          localStorage.setItem(THEME_KEY, next);
        } catch {
          // Theme still works when browser storage is unavailable.
        }
      }}
    >
      {theme === "dark" ? <Sun /> : <Moon />}
    </Button>
  );
}