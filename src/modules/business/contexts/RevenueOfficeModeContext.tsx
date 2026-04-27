import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type RevenueOfficeMode = "beginner" | "advanced";

interface RevenueOfficeModeContextType {
  mode: RevenueOfficeMode;
  isBeginner: boolean;
  toggleMode: () => void;
  setMode: (mode: RevenueOfficeMode) => void;
}

const RevenueOfficeModeContext = createContext<RevenueOfficeModeContextType>({
  mode: "advanced",
  isBeginner: false,
  toggleMode: () => {},
  setMode: () => {},
});

export function RevenueOfficeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<RevenueOfficeMode>(() => {
    try {
      return (localStorage.getItem("sita-revenue-office-mode") as RevenueOfficeMode) || "advanced";
    } catch {
      return "advanced";
    }
  });

  const toggleMode = useCallback(() => {
    setMode(prev => {
      const next = prev === "advanced" ? "beginner" : "advanced";
      try { localStorage.setItem("sita-revenue-office-mode", next); } catch {}
      return next;
    });
  }, []);

  const handleSetMode = useCallback((m: RevenueOfficeMode) => {
    setMode(m);
    try { localStorage.setItem("sita-revenue-office-mode", m); } catch {}
  }, []);

  return (
    <RevenueOfficeModeContext.Provider value={{ mode, isBeginner: mode === "beginner", toggleMode, setMode: handleSetMode }}>
      {children}
    </RevenueOfficeModeContext.Provider>
  );
}

export const useRevenueOfficeMode = () => useContext(RevenueOfficeModeContext);
