import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type ExplanationLevel = "simple" | "technical";

interface ExplainSimplyContextValue {
  level: ExplanationLevel;
  isSimple: boolean;
  toggle: () => void;
  setLevel: (level: ExplanationLevel) => void;
}

const ExplainSimplyContext = createContext<ExplainSimplyContextValue | null>(null);

function loadLevel(): ExplanationLevel {
  try {
    const stored = sessionStorage.getItem("admin-explain-level");
    return stored === "technical" ? "technical" : "simple";
  } catch { return "simple"; }
}

export function ExplainSimplyProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<ExplanationLevel>(loadLevel);

  const setLevel = useCallback((l: ExplanationLevel) => {
    setLevelState(l);
    try { sessionStorage.setItem("admin-explain-level", l); } catch {}
  }, []);

  const toggle = useCallback(() => {
    setLevelState(prev => {
      const next = prev === "simple" ? "technical" : "simple";
      try { sessionStorage.setItem("admin-explain-level", next); } catch {}
      return next;
    });
  }, []);

  return (
    <ExplainSimplyContext.Provider value={{ level, isSimple: level === "simple", toggle, setLevel }}>
      {children}
    </ExplainSimplyContext.Provider>
  );
}

export function useExplainSimply() {
  const ctx = useContext(ExplainSimplyContext);
  if (!ctx) throw new Error("useExplainSimply must be used within ExplainSimplyProvider");
  return ctx;
}
