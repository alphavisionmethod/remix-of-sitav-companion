import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

interface SplitViewState {
  active: boolean;
  leftPath: string;
  rightPath: string;
  activate: (left: string, right: string) => void;
  deactivate: () => void;
}

const STORAGE_KEY = "sita-split-view";

function loadState(): { active: boolean; leftPath: string; rightPath: string } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { active: false, leftPath: "/", rightPath: "/money" };
}

function saveState(state: { active: boolean; leftPath: string; rightPath: string }) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

const SplitViewContext = createContext<SplitViewState>({
  active: false, leftPath: "/", rightPath: "/money",
  activate: () => {}, deactivate: () => {},
});

export const useSplitView = () => useContext(SplitViewContext);

export const SplitViewProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState(loadState);

  useEffect(() => {
    saveState(state);
  }, [state]);

  const activate = (left: string, right: string) => {
    setState({ active: true, leftPath: left, rightPath: right });
  };

  const deactivate = () => {
    setState(prev => ({ ...prev, active: false }));
  };

  return (
    <SplitViewContext.Provider value={{ ...state, activate, deactivate }}>
      {children}
    </SplitViewContext.Provider>
  );
};
