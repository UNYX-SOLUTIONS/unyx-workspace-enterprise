import { useContext } from "react";
import { ThemeContext, type ThemeContextValue } from "../contexts/ThemeContext";

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme debe usarse dentro de ThemeProvider");
  return context;
};
