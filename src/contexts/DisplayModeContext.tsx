import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { MISSION_MODES, type MissionMode } from "@/lib/advisor-protocol";

type DisplayMode = "standard" | "focus" | "calm";

interface DisplayModeContextType {
  mode: DisplayMode;
  setMode: (mode: DisplayMode) => void;
  toggleFocus: () => void;
  toggleCalm: () => void;
  isFocus: boolean;
  isCalm: boolean;
  missionMode: MissionMode;
  setMissionMode: (modeId: string) => void;
}

const DisplayModeContext = createContext<DisplayModeContextType>({
  mode: "standard",
  setMode: () => {},
  toggleFocus: () => {},
  toggleCalm: () => {},
  isFocus: false,
  isCalm: false,
  missionMode: MISSION_MODES[0],
  setMissionMode: () => {},
});

export const useDisplayMode = () => useContext(DisplayModeContext);

export const DisplayModeProvider = ({ children }: { children: ReactNode }) => {
  const [mode, setMode] = useState<DisplayMode>("standard");
  const [missionModes, setMissionModes] = useState<MissionMode[]>(() => MISSION_MODES.map(m => ({ ...m })));

  const missionMode = missionModes.find(m => m.active) ?? missionModes[0];

  const setMissionModeById = useCallback((modeId: string) => {
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
    <DisplayModeContext.Provider value={{ mode, setMode, toggleFocus, toggleCalm, isFocus: mode === "focus", isCalm: mode === "calm", missionMode, setMissionMode: setMissionModeById }}>
      {children}
    </DisplayModeContext.Provider>
  );
};
