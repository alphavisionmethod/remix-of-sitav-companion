/**
 * AppearanceContext — Merged ThemeContext + DisplayModeContext
 * Single provider for theme, display mode, and mission mode.
 */
import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { MISSION_MODES, type MissionMode } from "@/lib/advisor-protocol";

type Theme = "dark" | "light" | "system";
type DisplayMode = "standard" | "focus" | "calm";

interface AppearanceContextValue {
  // Theme
  theme: Theme;
  setTheme: (t: Theme) => void;
  resolved: "dark" | "light";
  // Display mode
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
  toggleFocus: () => void;
  toggleCalm: () => void;
  isFocus: boolean;
  isCalm: boolean;
  // Mission mode
  missionMode: MissionMode;
  setMissionMode: (modeId: string) => void;
}

function getSystemTheme(): "dark" | "light" {
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

const AppearanceContext = createContext<AppearanceContextValue>({
  theme: "dark",
  setTheme: () => {},
  resolved: "dark",
  mode: "standard",
  setMode: () => {},
  toggleFocus: () => {},
  toggleCalm: () => {},
  isFocus: false,
  isCalm: false,
  missionMode: MISSION_MODES[0],
  setMissionMode: () => {},
});

export const useAppearance = () => useContext(AppearanceContext);

// Backwards-compat aliases
export const useTheme = () => {
  const { theme, setTheme, resolved } = useContext(AppearanceContext);
  return { theme, setTheme, resolved };
};
export const useDisplayMode = () => {
  const { mode, setMode, toggleFocus, toggleCalm, isFocus, isCalm, missionMode, setMissionMode } = useContext(AppearanceContext);
  return { mode, setMode, toggleFocus, toggleCalm, isFocus, isCalm, missionMode, setMissionMode };
};

export const AppearanceProvider = ({ children }: { children: ReactNode }) => {
  // ── Theme ──
  const [theme, setThemeState] = useState<Theme>(() => {
    const stored = localStorage.getItem("sita-theme");
    return (stored as Theme) || "dark";
  });
  const resolved = theme === "system" ? getSystemTheme() : theme;

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(resolved);
    localStorage.setItem("sita-theme", theme);
  }, [theme, resolved]);

  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => setThemeState("system");
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);

  // ── Display Mode ──
  const [mode, setMode] = useState<DisplayMode>("standard");
  const [missionModes, setMissionModes] = useState<MissionMode[]>(() => MISSION_MODES.map(m => ({ ...m })));

  const missionMode = missionModes.find(m => m.active) ?? missionModes[0];

  const setMissionMode = useCallback((modeId: string) => {
    setMissionModes(prev => prev.map(m => ({ ...m, active: m.id === modeId })));
  }, []);

  const toggleFocus = useCallback(() => {
    setMode(prev => prev === "focus" ? "standard" : "focus");
  }, []);

  const toggleCalm = useCallback(() => {
    setMode(prev => prev === "calm" ? "standard" : "calm");
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("focus-mode", "calm-mode");
    if (mode === "focus") root.classList.add("focus-mode");
    if (mode === "calm") root.classList.add("calm-mode");
  }, [mode]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMeta = e.metaKey || e.ctrlKey;
      if (isMeta && e.key === ".") { e.preventDefault(); toggleFocus(); }
      if (isMeta && e.key === ",") { e.preventDefault(); toggleCalm(); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleFocus, toggleCalm]);

  return (
    <AppearanceContext.Provider value={{
      theme, setTheme, resolved,
      mode, setMode, toggleFocus, toggleCalm,
      isFocus: mode === "focus", isCalm: mode === "calm",
      missionMode, setMissionMode,
    }}>
      {children}
    </AppearanceContext.Provider>
  );
};

// Re-export ThemeProvider name for backwards compat in App.tsx
export const ThemeProvider = AppearanceProvider;
