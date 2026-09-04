import { createContext, useEffect, useMemo, useState, type ReactNode } from "react";

export interface ThemeContextValue {
  dark: boolean;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [dark, setDark] = useState<boolean>(
    () => localStorage.getItem("unyx_theme") === "dark"
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("unyx_theme", dark ? "dark" : "light");
  }, [dark]);

  const value = useMemo(
    () => ({ dark, toggleTheme: () => setDark((v) => !v) }),
    [dark]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
